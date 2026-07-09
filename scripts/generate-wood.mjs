// Procedural seamless pale-oak desk texture.
// The CC0 oak_veneer maps are a multi-board veneer whose planks tile as
// distinct tonal rectangles across the flat desk — impossible to hide at
// grazing angles. This generates a single continuous fine-grained wood
// (warm, pale, no board seams) that tiles cleanly on both axes.
import sharp from "sharp";

const OUT = new URL("../public/assets/wood/", import.meta.url).pathname;
const S = 1024;

// feTurbulence with stitchTiles tiles seamlessly on both axes.
// ONLY fine high-frequency grain over a flat base — no low-frequency tone
// drift, because at grazing angles low-freq blobs tile into faint rectangular
// bands across the desk (the exact artifact this replaces).
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <!-- fine vertical grain: high frequency along x, moderate along y -->
      <feTurbulence type="fractalNoise" baseFrequency="0.13 0.03" numOctaves="5"
        seed="7" stitchTiles="stitch" result="g"/>
      <feColorMatrix in="g" type="matrix" values="
        0 0 0 0 0
        0 0 0 0 0
        0 0 0 0 0
        0 0 0 0.32 0"/>
    </filter>
  </defs>
  <!-- warm pale oak base -->
  <rect width="${S}" height="${S}" fill="#c3a677"/>
  <!-- fine grain: darker warm streaks only -->
  <rect width="${S}" height="${S}" fill="#8f7448" filter="url(#grain)"/>
</svg>`;

// darker grain streaks painted with a second pass for crisper lines
const grainSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <filter id="lines">
      <feTurbulence type="fractalNoise" baseFrequency="0.16 0.006" numOctaves="4"
        seed="31" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="
        0 0 0 0 0.30
        0 0 0 0 0.21
        0 0 0 0 0.11
        0 0 0 0.5 0"/>
    </filter>
  </defs>
  <rect width="${S}" height="${S}" filter="url(#lines)"/>
</svg>`;

const run = async () => {
  const base = await sharp(Buffer.from(svg)).png().toBuffer();
  await sharp(base)
    .composite([{ input: Buffer.from(grainSvg), blend: "multiply" }])
    .jpeg({ quality: 90 })
    .toFile(`${OUT}procedural_oak.jpg`);
  console.log("procedural_oak.jpg written");
};
run();
