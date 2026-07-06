"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * <CandleFlame> — additive-blended flame sprite + the scene's key light.
 * Layered sine "noise" drives the light intensity and the flame shape, so
 * speculars and shadows breathe with it.
 */

function flameTexture(size = 128): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size / 2;
  c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(
    size / 4, size * 0.72, size * 0.02,
    size / 4, size * 0.62, size * 0.42,
  );
  grad.addColorStop(0, "rgba(255,252,240,1)");
  grad.addColorStop(0.25, "rgba(255,214,140,0.9)");
  grad.addColorStop(0.55, "rgba(255,158,75,0.55)");
  grad.addColorStop(0.8, "rgba(255,110,40,0.18)");
  grad.addColorStop(1, "rgba(255,90,30,0)");
  g.fillStyle = grad;
  // teardrop: squash the gradient vertically toward the top
  g.save();
  g.translate(size / 4, size * 0.62);
  g.scale(0.62, 1.25);
  g.beginPath();
  g.arc(0, 0, size * 0.42, 0, Math.PI * 2);
  g.fill();
  g.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const noise = (t: number) =>
  0.62 * Math.sin(t * 7.3) * Math.sin(t * 1.7) +
  0.28 * Math.sin(t * 13.1 + 1.4) +
  0.1 * Math.sin(t * 29.7 + 0.6);

export function CandleFlame({
  position,
  lit,
  intensity = 15,
}: {
  position: [number, number, number];
  lit: boolean;
  intensity?: number;
}) {
  const light = useRef<THREE.PointLight>(null);
  const sprite = useRef<THREE.Sprite>(null);
  const ember = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => flameTexture(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const n = noise(t);
    if (light.current) {
      light.current.intensity = lit ? intensity * (1 + 0.13 * n) : 0;
    }
    if (sprite.current) {
      const target = lit ? 1 : 0;
      const s = THREE.MathUtils.lerp(sprite.current.scale.x / 0.11, target, 0.08);
      sprite.current.scale.set(
        0.15 * s * (1 + 0.05 * n),
        0.32 * s * (1 + 0.09 * n),
        1,
      );
      sprite.current.position.x = position[0] + 0.004 * n;
      sprite.current.material.opacity = THREE.MathUtils.lerp(
        sprite.current.material.opacity, lit ? 1 : 0, 0.08,
      );
    }
    if (ember.current) {
      (ember.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        lit ? 0 : 0.9 + 0.5 * Math.sin(t * 1.9);
    }
  });

  return (
    <group>
      {/* key light — soft PCF shadows, warm */}
      <pointLight
        ref={light}
        position={[position[0], position[1] + 0.34, position[2]]}
        color="#ffb066"
        intensity={0}
        distance={0}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0015}
        shadow-radius={6}
      />
      <sprite ref={sprite} position={[position[0], position[1] + 0.16, position[2]]} scale={[0, 0, 1]}>
        <spriteMaterial
          map={texture}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
      {/* glowing wick ember before the candle is lit */}
      <mesh ref={ember} position={[position[0], position[1] + 0.015, position[2]]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color="#1a0f08" emissive="#ff8840" emissiveIntensity={1} toneMapped={false} />
      </mesh>
    </group>
  );
}
