"use client";

/* eslint-disable react-hooks/immutability --
   useFrame callbacks run per-frame outside render; mutating three.js
   uniforms/objects there is the R3F idiom. */

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * <CandleFlame> — custom shader flame + the scene's key light.
 * One layered-noise signal drives BOTH the shader's flicker uniform and the
 * point-light intensity, so speculars and shadows move with the flame.
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

    // lateral sway grows with height; flicker widens it
    float sway = (fbm(vec2(uTime * 1.7, vUv.y * 3.0)) - 0.5) * 0.3 * vUv.y;
    uv.x += sway * (0.6 + 0.5 * uFlicker);

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
  const flame = useRef<THREE.Mesh>(null);
  const ember = useRef<THREE.Mesh>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: flameVertex,
        fragmentShader: flameFragment,
        uniforms: {
          uTime: { value: 0 },
          uFlicker: { value: 0 },
          uOpacity: { value: 0 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    const n = flickerNoise(t);
    // one signal, three consumers: light, shader, scale
    if (light.current) {
      light.current.intensity = lit ? intensity * (1 + 0.13 * n) : 0;
    }
    material.uniforms.uTime.value = t;
    material.uniforms.uFlicker.value = n;
    material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      material.uniforms.uOpacity.value, lit ? 1 : 0, 0.08,
    );
    if (flame.current) {
      // billboard toward the camera, growing in as it lights
      flame.current.quaternion.copy(camera.quaternion);
      const s = THREE.MathUtils.lerp(flame.current.scale.x, lit ? 1 : 0.001, 0.08);
      flame.current.scale.setScalar(s);
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
      {/* custom shader flame on a billboarded quad */}
      <mesh
        ref={flame}
        material={material}
        position={[position[0], position[1] + 0.3, position[2]]}
        scale={0.001}
      >
        <planeGeometry args={[0.17, 0.38]} />
      </mesh>
      {/* glowing wick ember before the candle is lit */}
      <mesh ref={ember} position={[position[0], position[1] + 0.015, position[2]]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color="#1a0f08" emissive="#ff8840" emissiveIntensity={1} toneMapped={false} />
      </mesh>
    </group>
  );
}
