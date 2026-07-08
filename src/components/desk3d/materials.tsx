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

/** Light oak, desaturated toward ash, satin clearcoat — the desk.
 *  Grain rotated to run the desk's length; repeat tuned so the veneer's board
 *  seams read as fine grain, not stripes (small repeat) or planks (large). */
export function OakWood(props: { repeat?: [number, number] }) {
  const [rx, ry] = props.repeat ?? [2.2, 1.4];
  const [diff, nor, rough, ao] = useTexture([
    "/assets/wood/oak_diff.jpg",
    "/assets/wood/oak_nor_gl.jpg",
    "/assets/wood/oak_rough.jpg",
    "/assets/wood/oak_ao.jpg",
  ]);
  useMemo(() => {
    // grain runs front-to-back (unrotated): the veneer's board seams read as
    // subtle grain lines; rotating exposed them as large tonal patches
    configure(diff, [rx, ry], "srgb");
    [nor, rough, ao].forEach((t) => configure(t, [rx, ry]));
  }, [diff, nor, rough, ao, rx, ry]);
  // spike debug: ?plain=1 strips the material down to diffuse-only
  if (typeof location !== "undefined" && location.search.includes("plain=1")) {
    return <meshStandardMaterial map={diff} />;
  }
  return (
    <meshPhysicalMaterial
      map={diff}
      // slightly cool multiply tint: pales the oak and pulls the orange out
      color="#e4e3db"
      normalMap={nor}
      roughnessMap={rough}
      aoMap={ao}
      clearcoat={0.12}
      clearcoatRoughness={0.75}
      envMapIntensity={0.35}
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
