"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

/** Real PBR texture sets (CC0, see public/assets/README.md). No CSS gradients. */

function configure(t: THREE.Texture, repeat: [number, number], colorSpace?: string) {
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  if (colorSpace) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Light oak with satin clearcoat — the desk. */
export function OakWood(props: { repeat?: [number, number] }) {
  const [rx, ry] = props.repeat ?? [2.2, 1.4];
  const [diff, nor, rough, ao] = useTexture([
    "/assets/wood/oak_diff.jpg",
    "/assets/wood/oak_nor_gl.jpg",
    "/assets/wood/oak_rough.jpg",
    "/assets/wood/oak_ao.jpg",
  ]);
  useMemo(() => {
    configure(diff, [rx, ry], "srgb");
    [nor, rough, ao].forEach((t) => configure(t, [rx, ry]));
  }, [diff, nor, rough, ao, rx, ry]);
  return (
    <meshPhysicalMaterial
      map={diff}
      normalMap={nor}
      roughnessMap={rough}
      aoMap={ao}
      clearcoat={0.18}
      clearcoatRoughness={0.55}
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
      normalScale={new THREE.Vector2(0.45, 0.45)}
      roughnessMap={rough}
      roughness={0.62}
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
  return (
    <meshPhysicalMaterial
      color="#f0e0c0"
      roughness={0.38}
      transmission={0.5}
      thickness={0.9}
      ior={1.44}
      attenuationColor="#ffb877"
      attenuationDistance={0.9}
      specularIntensity={0.6}
    />
  );
}
