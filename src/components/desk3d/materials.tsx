"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

// plain TextureLoader via useLoader — drei's useTexture eagerly initTexture()s
// on the GL context, which crashes ANGLE Metal in some Chromium builds
const useTexture = (urls: string[]) => useLoader(THREE.TextureLoader, urls);

/** Real PBR texture sets (CC0, see public/assets/README.md). No CSS gradients. */

function configure(
  t: THREE.Texture,
  repeat: [number, number],
  colorSpace?: string,
  rotation = 0,
) {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  if (rotation) {
    t.center.set(0.5, 0.5);
    t.rotation = rotation;
  }
  // spike debug: ?aniso=0 disables anisotropic filtering (suspected ANGLE Metal crash)
  if (typeof location === "undefined" || !location.search.includes("aniso=0")) {
    t.anisotropy = 8;
  }
  if (colorSpace) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Grand walnut — the desk. Procedurally generated flowing cathedral grain
 *  (scripts/generate-wood.mjs) plus a subtle matching normal map, mapped as one
 *  board across the whole desk (repeat [1,1]) so there is no tile seam. A faint
 *  clearcoat lets candlelight sweep across the surface; env reflection stays
 *  low so nothing mirrors the HDRI (that caused blocky rectangles before). */
export function OakWood(props: { repeat?: [number, number] }) {
  const [rx, ry] = props.repeat ?? [1, 1];
  const [diff, nor] = useTexture([
    "/assets/wood/walnut_diff.jpg",
    "/assets/wood/walnut_nor.jpg",
  ]);
  useMemo(() => {
    configure(diff, [rx, ry], "srgb");
    configure(nor, [rx, ry]);
  }, [diff, nor, rx, ry]);
  return (
    <meshPhysicalMaterial
      map={diff}
      color="#c7b49a"
      normalMap={nor}
      normalScale={new THREE.Vector2(0.22, 0.22)}
      roughness={0.66}
      metalness={0}
      clearcoat={0.3}
      clearcoatRoughness={0.62}
      envMapIntensity={0.12}
    />
  );
}

/** Brushed aluminum — MacBook body/lid. */
export function BrushedAluminum({ tint = "#cfc8bd" }: { tint?: string }) {
  const [color, nor, rough, metal] = useTexture([
    "/assets/metal/Metal009_1K-JPG_Color.jpg",
    "/assets/metal/Metal009_1K-JPG_NormalGL.jpg",
    "/assets/metal/Metal009_1K-JPG_Roughness.jpg",
    "/assets/metal/Metal009_1K-JPG_Metalness.jpg",
  ]);
  useMemo(() => {
    configure(color, [1.6, 1.6], "srgb");
    [nor, rough, metal].forEach((t) => configure(t, [1.6, 1.6]));
  }, [color, nor, rough, metal]);
  return (
    <meshStandardMaterial
      map={color}
      color={tint}
      normalMap={nor}
      normalScale={new THREE.Vector2(0.65, 0.65)}
      roughnessMap={rough}
      roughness={0.4}
      metalnessMap={metal}
      metalness={1}
    />
  );
}

/** Real paper — loose sheets, folder tint, post-its. */
export function PaperMaterial({
  tint = "#efe6d2",
  roughness = 1,
  repeat = [1, 1] as [number, number],
}: {
  tint?: string;
  roughness?: number;
  repeat?: [number, number];
}) {
  const [color, nor, rough] = useTexture([
    "/assets/paper/Paper001_1K-JPG_Color.jpg",
    "/assets/paper/Paper001_1K-JPG_NormalGL.jpg",
    "/assets/paper/Paper001_1K-JPG_Roughness.jpg",
  ]);
  useMemo(() => {
    configure(color, repeat, "srgb");
    [nor, rough].forEach((t) => configure(t, repeat));
  }, [color, nor, rough, repeat]);
  return (
    <meshStandardMaterial
      map={color}
      color={tint}
      normalMap={nor}
      roughnessMap={rough}
      roughness={roughness}
      metalness={0}
    />
  );
}

/** Candle wax — transmission + thickness fakes subsurface glow near the flame. */
export function WaxMaterial() {
  // spike debug: ?nowax=1 downgrades to a plain material to isolate GPU crashes
  if (typeof location !== "undefined" && location.search.includes("nowax=1")) {
    return <meshStandardMaterial color="#f0e0c0" roughness={0.38} />;
  }
  return (
    <meshPhysicalMaterial
      color="#eee3c8"
      roughness={0.42}
      transmission={0.32}
      thickness={0.7}
      ior={1.44}
      attenuationColor="#ffd9a3"
      attenuationDistance={1.4}
      specularIntensity={0.5}
    />
  );
}
