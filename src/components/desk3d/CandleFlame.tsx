"use client";

/* eslint-disable react-hooks/immutability --
   useFrame callbacks run per-frame outside render; mutating three.js
   uniforms/objects there is the R3F idiom. */

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { smokeTexture } from "./decals";
import type { SceneFocus } from "./objects";

/**
 * <CandleFlame> — custom shader flame + the scene's key light.
 * One layered-noise signal drives the shader flicker, the point-light
 * intensity, and the shadows/speculars. The flame leans gently toward the
 * cursor and steadies when an object is hovered; lighting it flares like a
 * match catching before settling.
 */

const flameVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const flameFragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uFlicker;
  uniform float uOpacity;
  uniform float uLean;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // x centered on the wick, y = 0 at the flame base
    vec2 uv = vec2(vUv.x - 0.5, vUv.y);

    // cursor lean + lateral sway grow with height; flicker widens the sway
    float sway = (fbm(vec2(uTime * 1.7, vUv.y * 3.0)) - 0.5) * 0.3 * vUv.y;
    uv.x += sway * (0.6 + 0.5 * uFlicker) + uLean * vUv.y * vUv.y;

    // teardrop: wide near the base, tapering to a point that dances
    float width = 0.30 * (1.0 - 0.75 * vUv.y * vUv.y) * (1.0 + 0.12 * uFlicker);
    float body = 1.0 - smoothstep(width * 0.25, width, abs(uv.x));
    float tip = 0.72 + 0.16 * uFlicker;
    float vert = smoothstep(0.02, 0.14, vUv.y) * (1.0 - smoothstep(tip * 0.72, tip, vUv.y));

    // licking noise eats at the silhouette
    float n = fbm(vec2(uv.x * 6.0, vUv.y * 4.0 - uTime * 3.4));
    float shape = clamp(body * vert * (0.65 + 0.6 * n), 0.0, 1.0);

    // warm ramp with a near-white core low in the flame
    vec3 col = mix(vec3(1.0, 0.55, 0.24), vec3(1.0, 0.79, 0.45), shape);
    float core = smoothstep(0.4, 0.95, shape) * (1.0 - smoothstep(0.12, 0.5, vUv.y));
    col = mix(col, vec3(1.0, 0.97, 0.9), core);

    float alpha = shape * uOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col * (1.35 + 0.65 * uFlicker), alpha);
  }
`;

const flickerNoise = (t: number) =>
  0.62 * Math.sin(t * 7.3) * Math.sin(t * 1.7) +
  0.28 * Math.sin(t * 13.1 + 1.4) +
  0.1 * Math.sin(t * 29.7 + 0.6);

function hazeTexture(size = 128): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, "rgba(255,190,120,0.55)");
  gr.addColorStop(0.5, "rgba(255,160,80,0.16)");
  gr.addColorStop(1, "rgba(255,140,60,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

export function CandleFlame({
  position,
  lit,
  instant = false,
  reduced = false,
  focus,
  intensity = 38,
}: {
  position: [number, number, number];
  lit: boolean;
  instant?: boolean;
  reduced?: boolean;
  focus?: React.RefObject<SceneFocus>;
  intensity?: number;
}) {
  const light = useRef<THREE.PointLight>(null);
  const flame = useRef<THREE.Mesh>(null);
  const ember = useRef<THREE.Mesh>(null);
  const haze = useRef<THREE.Sprite>(null);
  const smoke = useRef<THREE.Mesh>(null);
  const wasLit = useRef(lit);
  const flareAt = useRef(-100);
  const lean = useRef(0);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: flameVertex,
        fragmentShader: flameFragment,
        uniforms: {
          uTime: { value: 0 },
          uFlicker: { value: 0 },
          uOpacity: { value: 0 },
          uLean: { value: 0 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const hazeMap = useMemo(() => hazeTexture(), []);
  const smokeMap = useMemo(() => smokeTexture(), []);

  useFrame(({ clock, camera, pointer }) => {
    const t = clock.elapsedTime;

    // the match catches: a brief flare when freshly lit (not on instant restore)
    if (lit !== wasLit.current) {
      if (lit && !instant) flareAt.current = t;
      wasLit.current = lit;
    }
    const flare = lit ? Math.exp(-Math.max(0, t - flareAt.current) * 3.2) * 1.7 : 0;

    // steadied flicker + zero lean while the visitor is reading an object
    const hovered = focus?.current?.hovered ?? false;
    const n = flickerNoise(t) * (hovered ? 0.35 : 1);
    const targetLean = reduced || hovered ? 0 : THREE.MathUtils.clamp(pointer.x, -1, 1) * 0.22;
    lean.current = THREE.MathUtils.lerp(lean.current, targetLean, 0.05);

    if (light.current) {
      light.current.intensity = lit ? intensity * (1 + 0.13 * n) * (1 + flare) : 0;
    }
    material.uniforms.uTime.value = t;
    material.uniforms.uFlicker.value = n;
    material.uniforms.uLean.value = lean.current;
    material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      material.uniforms.uOpacity.value, lit ? 1 : 0, 0.08,
    );
    if (flame.current) {
      flame.current.quaternion.copy(camera.quaternion);
      const s = THREE.MathUtils.lerp(flame.current.scale.x, lit ? 1 + flare * 0.35 : 0.001, 0.09);
      flame.current.scale.setScalar(s);
    }
    if (haze.current) {
      // carries the candle glow now that post-bloom is gone
      const target = lit ? 0.55 + 0.08 * n * (1 + flare) : 0;
      haze.current.material.opacity = THREE.MathUtils.lerp(haze.current.material.opacity, target, 0.05);
      const hs = 2.3 + flare * 0.8;
      haze.current.scale.set(hs, hs, 1);
    }
    if (smoke.current) {
      // a thin wisp rising off the flame tip, swaying with the noise
      const mat = smoke.current.material as THREE.MeshBasicMaterial;
      const target = lit && !reduced ? 0.16 : 0;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, 0.04);
      smoke.current.quaternion.copy(camera.quaternion);
      smoke.current.position.x = position[0] + 0.02 + 0.025 * Math.sin(t * 0.7) + lean.current * 0.1;
      smoke.current.rotation.z = 0.06 * Math.sin(t * 0.5);
    }
    if (ember.current) {
      (ember.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        lit ? 0 : 0.9 + 0.5 * Math.sin(t * 1.9);
    }
  });

  return (
    <group>
      {/* key light — soft PCF shadows, warm; flicker-synced with the shader */}
      <pointLight
        ref={light}
        position={[position[0], position[1] + 0.38, position[2]]}
        color="#ffb066"
        intensity={0}
        distance={0}
        decay={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0015}
        shadow-radius={4}
      />
      {/* custom shader flame on a billboarded quad */}
      <mesh
        ref={flame}
        material={material}
        position={[position[0], position[1] + 0.3, position[2]]}
        scale={0.001}
      >
        <planeGeometry args={[0.17, 0.38]} />
      </mesh>
      {/* volumetric-ish haze pooling around the flame */}
      <sprite ref={haze} position={[position[0], position[1] + 0.32, position[2]]} scale={[1.9, 1.9, 1]}>
        <spriteMaterial map={hazeMap} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* thin smoke wisp above the tip */}
      <mesh ref={smoke} position={[position[0], position[1] + 0.85, position[2]]}>
        <planeGeometry args={[0.16, 0.75]} />
        <meshBasicMaterial map={smokeMap} transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* glowing wick ember before the candle is lit */}
      <mesh ref={ember} position={[position[0], position[1] + 0.015, position[2]]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color="#1a0f08" emissive="#ff8840" emissiveIntensity={1} toneMapped={false} />
      </mesh>
    </group>
  );
}
