"use client";

import * as THREE from "three";

/**
 * Decal textures painted onto 2D canvases at runtime (bitmap textures for the
 * PBR pipeline — not DOM/vector shapes in the scene).
 */

/** Faint handwritten-looking ruled lines (no legible words) for the top sheet. */
export function ruledNotesTexture(size = 512): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, size, size);
  g.strokeStyle = "rgba(60,48,38,0.5)";
  g.lineCap = "round";
  const left = size * 0.16;
  let y = size * 0.2;
  while (y < size * 0.82) {
    const len = size * (0.4 + Math.random() * 0.35);
    g.lineWidth = 2.4;
    g.beginPath();
    let x = left;
    g.moveTo(x, y + (Math.random() - 0.5) * 3);
    // wavy scribble stroke standing in for a line of writing
    const seg = 18;
    for (let s = 1; s <= seg; s++) {
      x = left + (len * s) / seg;
      g.lineTo(x, y + Math.sin(s * 0.9 + y) * 2.4 + (Math.random() - 0.5) * 2);
    }
    g.stroke();
    y += size * (0.07 + Math.random() * 0.03);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Pebbled leather grain as a grayscale bump map (used on the desk mat). */
export function leatherBumpTexture(size = 512): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, size, size);
  // scattered soft pebbles: light domes with dark creases between them
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 3 + Math.random() * 7;
    const light = Math.random() > 0.5;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.12 + Math.random() * 0.12;
    if (light) {
      gr.addColorStop(0, `rgba(255,255,255,${a})`);
      gr.addColorStop(1, "rgba(255,255,255,0)");
    } else {
      gr.addColorStop(0, `rgba(0,0,0,${a})`);
      gr.addColorStop(1, "rgba(0,0,0,0)");
    }
    g.fillStyle = gr;
    g.fillRect(0, 0, size, size);
  }
  // fine speckle for micro-grain
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
    g.fillRect(Math.random() * size, Math.random() * size, 1.4, 1.4);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

export function appleLogoAlpha(size = 256): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, size, size);
  g.fillStyle = "#fff";
  const s = size / 100;
  // apple body: two overlapping lobes with side notches
  g.beginPath();
  g.moveTo(50 * s, 32 * s);
  g.bezierCurveTo(38 * s, 22 * s, 20 * s, 28 * s, 20 * s, 52 * s);
  g.bezierCurveTo(20 * s, 72 * s, 34 * s, 90 * s, 44 * s, 90 * s);
  g.bezierCurveTo(48 * s, 90 * s, 49 * s, 88 * s, 50 * s, 88 * s);
  g.bezierCurveTo(51 * s, 88 * s, 52 * s, 90 * s, 56 * s, 90 * s);
  g.bezierCurveTo(66 * s, 90 * s, 80 * s, 72 * s, 80 * s, 52 * s);
  g.bezierCurveTo(80 * s, 28 * s, 62 * s, 22 * s, 50 * s, 32 * s);
  g.closePath();
  g.fill();
  // bite
  g.globalCompositeOperation = "destination-out";
  g.beginPath();
  g.arc(88 * s, 48 * s, 16 * s, 0, Math.PI * 2);
  g.fill();
  g.globalCompositeOperation = "source-over";
  // leaf
  g.beginPath();
  g.moveTo(52 * s, 28 * s);
  g.bezierCurveTo(52 * s, 18 * s, 60 * s, 10 * s, 68 * s, 10 * s);
  g.bezierCurveTo(68 * s, 20 * s, 60 * s, 28 * s, 52 * s, 28 * s);
  g.closePath();
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  return t;
}

/** Paused-video screen for the propped phone: warm blurry frame, play glyph, progress bar. */
export function videoScreenTexture(w = 256, h = 512): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  // dark warm "paused frame": soft amber blobs on near-black
  g.fillStyle = "#171009";
  g.fillRect(0, 0, w, h);
  const blob = (x: number, y: number, r: number, col: string) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, col);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  };
  blob(w * 0.35, h * 0.3, w * 0.9, "rgba(255,158,75,0.35)");
  blob(w * 0.7, h * 0.62, w * 0.7, "rgba(180,110,60,0.3)");
  blob(w * 0.5, h * 0.85, w * 0.5, "rgba(90,60,40,0.35)");
  // play glyph in a translucent circle
  g.fillStyle = "rgba(20,14,10,0.55)";
  g.beginPath();
  g.arc(w / 2, h / 2, w * 0.16, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(243,233,216,0.92)";
  g.beginPath();
  g.moveTo(w / 2 - w * 0.05, h / 2 - w * 0.08);
  g.lineTo(w / 2 - w * 0.05, h / 2 + w * 0.08);
  g.lineTo(w / 2 + w * 0.09, h / 2);
  g.closePath();
  g.fill();
  // progress bar, partly played
  g.fillStyle = "rgba(243,233,216,0.25)";
  g.fillRect(w * 0.08, h * 0.94, w * 0.84, 4);
  g.fillStyle = "rgba(255,203,120,0.9)";
  g.fillRect(w * 0.08, h * 0.94, w * 0.84 * 0.4, 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Soft grey wisp for candle smoke — a faint S-curve of blurred blobs. */
export function smokeTexture(w = 64, h = 256): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, w, h);
  for (let i = 0; i < 14; i++) {
    const p = i / 13;
    const x = w / 2 + Math.sin(p * Math.PI * 2.2) * w * 0.18;
    const y = h - p * h;
    const r = 3 + p * 9;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.16 * Math.sin(Math.PI * p); // fade in from wick, out at top
    gr.addColorStop(0, `rgba(190,180,170,${a})`);
    gr.addColorStop(1, "rgba(190,180,170,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  }
  const t = new THREE.CanvasTexture(c);
  return t;
}

/** Worn book cover: title + author, corner scuffing, creased spine edge. */
export function bookCoverTexture(
  title: string,
  author: string,
  { bg, ink = "#e8dcc2", w = 420, h = 560 }: { bg: string; ink?: string; w?: number; h?: number },
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  // cloth tooth
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6);
  }
  // worn corners + edges: darken with soft radial shadows
  const wear = (x: number, y: number, r: number, a: number) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(20,12,6,${a})`);
    gr.addColorStop(1, "rgba(20,12,6,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  };
  wear(0, 0, w * 0.3, 0.35);
  wear(w, 0, w * 0.26, 0.3);
  wear(0, h, w * 0.28, 0.35);
  wear(w, h, w * 0.3, 0.32);
  // lightened rub along the fore-edge and a crease line near the spine
  g.fillStyle = "rgba(255,240,215,0.08)";
  g.fillRect(w - 14, 0, 14, h);
  g.fillStyle = "rgba(0,0,0,0.22)";
  g.fillRect(26, 0, 3, h);
  g.fillStyle = "rgba(255,240,215,0.1)";
  g.fillRect(30, 0, 2, h);
  // rule + title + author, classic and legible
  g.strokeStyle = `${ink}cc`;
  g.lineWidth = 2;
  g.strokeRect(w * 0.14, h * 0.22, w * 0.72, h * 0.4);
  g.fillStyle = ink;
  g.textAlign = "center";
  // title shrunk to fit inside the frame width (handles long single-word titles)
  const maxTitleW = w * 0.62;
  let fs = Math.round(h * 0.09);
  g.font = `600 ${fs}px Georgia, serif`;
  while (g.measureText(title).width > maxTitleW && fs > 12) {
    fs -= 2;
    g.font = `600 ${fs}px Georgia, serif`;
  }
  g.fillText(title, w / 2, h * 0.36);
  g.font = `${Math.round(h * 0.045)}px Georgia, serif`;
  g.fillStyle = `${ink}b0`;
  g.fillText(author.toUpperCase(), w / 2, h * 0.52);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function handwritingTexture(
  lines: string[],
  {
    bg = "#e9c964",
    ink = "#3b2f2a",
    width = 512,
    height = 512,
    fontFrac = 0.17,
  }: { bg?: string; ink?: string; width?: number; height?: number; fontFrac?: number } = {},
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, width, height);
  // faint paper tooth so the card doesn't read as flat color
  for (let i = 0; i < (width * height) / 55; i++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * 0.03})`;
    g.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
  }
  g.fillStyle = ink;
  g.font = `600 ${Math.round(height * fontFrac)}px "Bradley Hand", "Comic Sans MS", cursive`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const start = 0.5 - ((lines.length - 1) * fontFrac * 1.35) / 2;
  lines.forEach((l, i) => {
    g.save();
    g.translate(width / 2, height * (start + i * fontFrac * 1.35));
    g.rotate((Math.random() - 0.5) * 0.03);
    g.fillText(l, 0, 0);
    g.restore();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
