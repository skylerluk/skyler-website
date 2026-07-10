// Procedural seamless walnut desk texture — flowing cathedral grain.
//
// SVG feTurbulence (the previous approach) can only make fine streaks, which
// tiled into a "corduroy" look. This computes real domain-warped fBm noise per
// pixel to get long, arcing walnut figure. Periodic lattice noise (integer
// octave multipliers) makes it tile seamlessly on both axes. Outputs a diffuse
// map and a subtle matching normal map so candlelight sweeps across the grain.
import sharp from "sharp";

const OUT = new URL("../public/assets/wood/", import.meta.url).pathname;
const S = 1024;
const P = 8; // noise lattice period (in cells) — tiles seamlessly

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// periodic value noise over a P×P lattice (wraps → seamless)
function makeNoise(seed) {
  const rnd = mulberry32(seed);
  const g = new Float32Array(P * P);
  for (let i = 0; i < g.length; i++) g[i] = rnd();
  const at = (ix, iy) => g[((iy % P) + P) % P * P + (((ix % P) + P) % P)];
  return (x, y) => {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const n00 = at(x0, y0), n10 = at(x0 + 1, y0);
    const n01 = at(x0, y0 + 1), n11 = at(x0 + 1, y0 + 1);
    const a = n00 + (n10 - n00) * sx;
    const b = n01 + (n11 - n01) * sx;
    return a + (b - a) * sy;
  };
}

const nA = makeNoise(11), nB = makeNoise(29), nC = makeNoise(53), nD = makeNoise(71);
// fbm with integer octave steps so every octave still wraps over the tile
function fbm(noise, x, y, oct = 4) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * noise(x * f, y * f);
    f *= 2;
    amp *= 0.5;
  }
  return v;
}

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mix3 = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

// warm walnut palette
const SAP = [150, 112, 74]; // lighter figure
const HEART = [96, 66, 42]; // mid heartwood
const LINE = [52, 33, 20]; // dark latewood ring lines

// height field (for the normal map) and colour, shared per pixel.
// Cathedral figure: concentric elliptical growth rings from a centre BELOW the
// board, so the visible portion is the sweeping arch — the classic plainsawn
// "flame". One board across the whole desk (repeat [1,1]) → no tile seam.
function sample(u, v) {
  // gentle domain warp for organic, non-mechanical rings
  const wu = u + 0.05 * (fbm(nA, u * 4, v * 4) - 0.5);
  const wv = v + 0.05 * (fbm(nB, u * 4 + 3.1, v * 4 + 7.7) - 0.5);

  // ring centre sits well OFF the board (below-left) so we only ever see the
  // sweeping arcs — never a bullseye. Apex wanders gently for organic figure.
  const cx = -0.55 + 0.18 * (fbm(nD, u * 0.8, v * 0.6) - 0.5);
  const cy = 1.75 + 0.2 * (fbm(nA, u * 0.7 + 2, v * 0.5) - 0.5);
  const dx = wu - cx;
  const dy = wv - cy;
  const d = Math.sqrt(dx * dx * 1.5 + dy * dy); // x-stretch widens the arches

  const ringCount = 6;
  const phase = d * ringCount + 0.5 * fbm(nC, wu * 2.5, wv * 2.5);
  const ring = 0.5 + 0.5 * Math.cos(phase * Math.PI * 2);
  // organic figure varies line contrast — latewood isn't a uniform stripe
  const figure = fbm(nD, wu * 1.6, wv * 1.6);
  const lines = Math.pow(ring, 3.0) * (0.7 + 0.6 * figure);

  // fine long streaks running with the grain
  const streak = fbm(nC, wu * 46, wv * 4) - 0.5;

  let col = mix3(HEART, SAP, clamp01(figure * 0.85 + 0.16 + streak * 0.32));
  col = mix3(col, LINE, clamp01(lines * 0.85));

  const height = clamp01(lines * 0.72 + (0.5 + streak) * 0.3 + figure * 0.15);
  return { col, height };
}

const run = async () => {
  const diff = Buffer.alloc(S * S * 3);
  const hgt = new Float32Array(S * S);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const { col, height } = sample((x / S) * P, (y / S) * P);
      const i = y * S + x;
      diff[i * 3] = col[0];
      diff[i * 3 + 1] = col[1];
      diff[i * 3 + 2] = col[2];
      hgt[i] = height;
    }
  }
  await sharp(diff, { raw: { width: S, height: S, channels: 3 } })
    .jpeg({ quality: 92 })
    .toFile(`${OUT}walnut_diff.jpg`);

  // subtle normal map from the height field (sobel), gentle strength
  const nor = Buffer.alloc(S * S * 3);
  const h = (x, y) => hgt[((y + S) % S) * S + ((x + S) % S)];
  const strength = 1.4;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      let nx = -dx, ny = -dy, nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len; ny /= len; nz /= len;
      const i = (y * S + x) * 3;
      nor[i] = Math.round((nx * 0.5 + 0.5) * 255);
      nor[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      nor[i + 2] = Math.round((nz * 0.5 + 0.5) * 255);
    }
  }
  await sharp(nor, { raw: { width: S, height: S, channels: 3 } })
    .jpeg({ quality: 90 })
    .toFile(`${OUT}walnut_nor.jpg`);

  console.log("walnut_diff.jpg + walnut_nor.jpg written");
};
run();
