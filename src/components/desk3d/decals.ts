"use client";

import * as THREE from "three";

/**
 * Decal textures painted onto 2D canvases at runtime (bitmap textures for the
 * PBR pipeline — not DOM/vector shapes in the scene).
 */

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
