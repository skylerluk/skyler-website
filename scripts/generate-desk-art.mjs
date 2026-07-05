// PLACEHOLDER ART GENERATOR — produces the baked 2.5D desk layers as a
// swappable skin (base + per-object PNGs + manifest). When Skyler approves a
// real cinematic render, slice it to the same filenames/manifest and delete
// this script's output. Layout follows 02-flow-and-motion.md.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const W = 2400;
const H = 1500;
const OUT = new URL("../public/desk/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const defs = `
<defs>
  <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#7a5333"/>
    <stop offset="0.45" stop-color="#8f6238"/>
    <stop offset="1" stop-color="#6a452a"/>
  </linearGradient>
  <radialGradient id="warmlight" cx="0.32" cy="0.32" r="0.95">
    <stop offset="0" stop-color="#ffcb78" stop-opacity="0.34"/>
    <stop offset="0.45" stop-color="#ff9e4b" stop-opacity="0.12"/>
    <stop offset="1" stop-color="#1a0f08" stop-opacity="0.55"/>
  </radialGradient>
  <linearGradient id="alu" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#cbbba2"/>
    <stop offset="1" stop-color="#93816c"/>
  </linearGradient>
  <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#241a14"/>
    <stop offset="0.7" stop-color="#160f0b"/>
    <stop offset="1" stop-color="#31220f"/>
  </linearGradient>
  <linearGradient id="manila" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d8b578"/>
    <stop offset="1" stop-color="#b28e55"/>
  </linearGradient>
  <linearGradient id="wax" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f6e7c8"/>
    <stop offset="1" stop-color="#d9bf92"/>
  </linearGradient>
  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f0e4cc"/>
    <stop offset="1" stop-color="#dcc9a4"/>
  </linearGradient>
  <linearGradient id="postit" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f0cd66"/>
    <stop offset="1" stop-color="#d9ae45"/>
  </linearGradient>
  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#140b05" flood-opacity="0.55"/>
  </filter>
  <filter id="softsm" x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#140b05" flood-opacity="0.5"/>
  </filter>
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.35 0.25 0 0 0"/>
    <feComposite operator="over" in2="SourceGraphic"/>
  </filter>
  <filter id="woodgrain">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="3" seed="7" stitchTiles="stitch"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.18  0 0 0 0 0.10  0 0 0 0 0.04  0 0 0 0.22 0"/>
  </filter>
</defs>`;

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`;

// ---------- base desk (lit state, ambiance objects baked in) ----------
const baseBody = `
  <rect width="${W}" height="${H}" fill="url(#wood)"/>
  <rect width="${W}" height="${H}" filter="url(#woodgrain)" opacity="0.5"/>
  <!-- pens above the notebook (ambiance) -->
  <g transform="translate(430,470) rotate(-8)" filter="url(#softsm)">
    <rect width="300" height="16" rx="8" fill="#2d2622"/>
    <rect y="30" width="280" height="14" rx="7" fill="#4a3d33"/>
    <rect y="58" width="260" height="13" rx="6" fill="#b89a6e"/>
    <polygon points="260,58 292,64 260,71" fill="#3b2f2a"/>
  </g>
  <!-- loose papers right of the MacBook (ambiance) -->
  <g transform="translate(1600,470)">
    <rect transform="rotate(6)" width="330" height="430" rx="6" fill="url(#paper)" filter="url(#softsm)"/>
    <rect transform="translate(30,-16) rotate(-3)" width="330" height="430" rx="6" fill="#eee0c4" filter="url(#softsm)"/>
    <g transform="translate(30,-16) rotate(-3)" fill="#3b2f2a" opacity="0.45">
      ${Array.from({ length: 9 }, (_, i) => `<rect x="36" y="${52 + i * 40}" width="${250 - (i % 3) * 40}" height="7" rx="3"/>`).join("")}
    </g>
  </g>
  <!-- ethos post-it near center (ambiance) -->
  <g transform="translate(920,1010) rotate(-5)" filter="url(#softsm)">
    <rect width="200" height="200" fill="url(#postit)"/>
    <text x="100" y="86" text-anchor="middle" font-family="Bradley Hand, Comic Sans MS, cursive" font-size="30" fill="#3b2f2a">actions &gt;</text>
    <text x="100" y="128" text-anchor="middle" font-family="Bradley Hand, Comic Sans MS, cursive" font-size="30" fill="#3b2f2a">words</text>
  </g>
  <!-- two books, left/front (ambiance) -->
  <g transform="translate(260,1090) rotate(4)" filter="url(#soft)">
    <rect width="360" height="120" rx="8" fill="#5a3a2e"/>
    <rect x="0" y="10" width="18" height="100" fill="#3d271e"/>
    <text x="180" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#e9d9b8" opacity="0.85" letter-spacing="4">SELF-RELIANCE</text>
  </g>
  <g transform="translate(300,970) rotate(-2)" filter="url(#softsm)">
    <rect width="330" height="104" rx="8" fill="#8a6a3c"/>
    <rect x="312" y="8" width="14" height="88" fill="#6d5330"/>
    <text x="165" y="64" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#f3e9d8" opacity="0.85" letter-spacing="3">MEDITATIONS</text>
  </g>
  <!-- baked warm light + vignette -->
  <rect width="${W}" height="${H}" fill="url(#warmlight)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.05"/>
`;

// ---------- interactive objects (transparent PNGs) ----------
// Each drawn at its desk position inside a full-size canvas so compositing is trivial.
const objects = {
  // MacBook — center. Gentle top-down: keyboard deck in front, screen leaning back.
  laptop: `
  <g filter="url(#soft)">
    <g transform="translate(915,470)">
      <polygon points="60,0 510,0 570,290 0,290" fill="url(#screen)" stroke="#a5947e" stroke-width="6"/>
      <polygon points="80,20 490,20 540,270 30,270" fill="#1b120c"/>
      <radialGradient id="scrglow" cx="0.5" cy="0.85" r="0.8">
        <stop offset="0" stop-color="#ff9e4b" stop-opacity="0.28"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
      <polygon points="80,20 490,20 540,270 30,270" fill="url(#scrglow)"/>
      <rect x="0" y="290" width="570" height="14" fill="#8f8072"/>
      <path d="M -45 304 L 615 304 L 665 560 Q 665 578 645 578 L -25 578 Q -45 578 -45 560 Z" fill="url(#alu)"/>
      <g fill="#7d6e5c">
        ${Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 13 }, (_, c) =>
            `<rect x="${25 + c * 41 + r * 4}" y="${330 + r * 38}" width="34" height="30" rx="5"/>`).join("")).join("")}
      </g>
      <rect x="185" y="528" width="220" height="36" rx="8" fill="#877966"/>
    </g>
  </g>`,
  // Black composition notebook — left of the MacBook.
  notebook: `
  <g filter="url(#soft)" transform="translate(360,640) rotate(-4)">
    <rect width="380" height="500" rx="10" fill="#221b17"/>
    <rect width="380" height="500" rx="10" filter="url(#grain)" opacity="0.35"/>
    <rect x="0" y="0" width="46" height="500" rx="10" fill="#0f0b09"/>
    <rect x="95" y="150" width="210" height="120" rx="6" fill="#e9dcc0"/>
    <line x1="115" y1="190" x2="285" y2="190" stroke="#3b2f2a" stroke-width="3"/>
    <line x1="115" y1="220" x2="285" y2="220" stroke="#3b2f2a" stroke-width="3"/>
    <text x="200" y="182" text-anchor="middle" font-family="Bradley Hand, cursive" font-size="26" fill="#3b2f2a">writings</text>
  </g>`,
  // Phone propped on the right — Video.
  phone: `
  <g filter="url(#soft)" transform="translate(1790,800) rotate(7)">
    <rect width="220" height="440" rx="34" fill="#17110d" stroke="#3a2f26" stroke-width="6"/>
    <radialGradient id="phglow" cx="0.5" cy="0.35" r="0.9">
      <stop offset="0" stop-color="#ffcb78" stop-opacity="0.5"/><stop offset="1" stop-color="#31220f" stop-opacity="0.9"/>
    </radialGradient>
    <rect x="12" y="12" width="196" height="416" rx="26" fill="url(#phglow)"/>
    <polygon points="92,190 92,260 148,225" fill="#f3e9d8" opacity="0.92"/>
  </g>`,
  // Manila folder — lower center.
  folder: `
  <g filter="url(#soft)" transform="translate(1090,1090) rotate(2)">
    <path d="M0 40 Q0 28 12 28 L150 28 L190 0 L360 0 Q372 0 372 12 L372 40 Z" fill="#b28e55"/>
    <rect y="40" width="620" height="330" rx="10" fill="url(#manila)"/>
    <rect x="26" y="40" width="568" height="318" rx="8" fill="#e9dcc0" opacity="0.35"/>
    <text x="310" y="230" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="#3b2f2a" opacity="0.75" letter-spacing="6">WORK</text>
  </g>`,
  // Yellow "about me" post-it — top right.
  "postit-about": `
  <g filter="url(#softsm)" transform="translate(1940,220) rotate(6)">
    <rect width="230" height="230" fill="url(#postit)"/>
    <path d="M0 0 L230 0 L230 26 Q115 44 0 26 Z" fill="#f7dd8a" opacity="0.8"/>
    <text x="115" y="105" text-anchor="middle" font-family="Bradley Hand, Comic Sans MS, cursive" font-size="40" fill="#3b2f2a">about</text>
    <text x="115" y="155" text-anchor="middle" font-family="Bradley Hand, Comic Sans MS, cursive" font-size="40" fill="#3b2f2a">me</text>
  </g>`,
  // Candle — upper left. Wax + brass dish; the FLAME itself is a live CSS sprite.
  candle: `
  <g filter="url(#soft)" transform="translate(220,240)">
    <ellipse cx="130" cy="330" rx="150" ry="42" fill="#6d5330"/>
    <ellipse cx="130" cy="322" rx="150" ry="40" fill="#a07f47"/>
    <rect x="55" y="90" width="150" height="230" rx="16" fill="url(#wax)"/>
    <path d="M55 110 Q80 140 70 180 Q60 220 55 200 Z" fill="#fff6e3" opacity="0.8"/>
    <ellipse cx="130" cy="92" rx="75" ry="22" fill="#efe0bd"/>
    <ellipse cx="130" cy="96" rx="52" ry="14" fill="#d9bf92"/>
    <rect x="126" y="58" width="8" height="34" rx="4" fill="#2b211a"/>
  </g>`,
};

// ---------- hit areas (fractions of canvas, x/y/w/h) ----------
const manifest = {
  canvas: { w: W, h: H },
  art: "placeholder-v1 (programmatic). Swap: replace /public/desk assets, keep filenames + this manifest shape.",
  objects: [
    { id: "candle", label: "light", section: null, route: null, asset: "obj-candle.png", depth: 0.5,
      hit: { x: 0.075, y: 0.14, w: 0.135, h: 0.31 } },
    { id: "notebook", label: "Writings", section: "writings", route: "/writings", asset: "obj-notebook.png", depth: 0.8,
      hit: { x: 0.135, y: 0.41, w: 0.175, h: 0.36 } },
    { id: "laptop", label: "Technical Builds", section: "builds", route: "/builds", asset: "obj-laptop.png", depth: 1.0,
      hit: { x: 0.36, y: 0.3, w: 0.3, h: 0.42 } },
    { id: "folder", label: "Work & Ventures", section: "work", route: "/work", asset: "obj-folder.png", depth: 1.1,
      hit: { x: 0.45, y: 0.72, w: 0.27, h: 0.26 } },
    { id: "postit-about", label: "About Me", section: "about", route: "/about", asset: "obj-postit-about.png", depth: 0.6,
      hit: { x: 0.8, y: 0.13, w: 0.115, h: 0.19 } },
    { id: "phone", label: "Video", section: "video", route: "/video", asset: "obj-phone.png", depth: 0.9,
      hit: { x: 0.735, y: 0.52, w: 0.115, h: 0.33 } },
  ],
  // flame anchor (fraction of canvas) — the live CSS flame + glow center on this.
  flame: { x: 0.146, y: 0.19 },
};

const run = async () => {
  await sharp(Buffer.from(svg(W, H, baseBody))).webp({ quality: 82 }).toFile(`${OUT}base.webp`);
  // poster: tiny blurred base for instant first paint
  await sharp(Buffer.from(svg(W, H, baseBody))).resize(48).blur(1.5).webp({ quality: 50 }).toFile(`${OUT}poster.webp`);
  for (const [id, body] of Object.entries(objects)) {
    await sharp(Buffer.from(svg(W, H, body))).png({ compressionLevel: 9, palette: true }).toFile(`${OUT}obj-${id}.png`);
  }
  writeFileSync(`${OUT}manifest.json`, JSON.stringify(manifest, null, 2));
  console.log("desk art written to public/desk/");
};
run();
