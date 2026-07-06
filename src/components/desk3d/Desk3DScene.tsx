"use client";

/* eslint-disable react-hooks/immutability --
   useFrame callbacks run per-frame outside render; mutating three.js objects
   (camera, renderer exposure, scene env) there is the R3F idiom. */

import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { CandleFlame } from "./CandleFlame";
import {
  Books, Candle, DeskObject3D, DeskSlab, Folder, Macbook, Notebook, Papers, Pens, Phone, PostIt,
} from "./objects";

const FLAME_POS: [number, number, number] = [-1.7, 0.5, -0.75];

// spike debug: raw texture, zero property mutations
function MinTexturedMaterial() {
  const tex = useLoader(THREE.TextureLoader, "/assets/wood/oak_diff.jpg");
  return <meshStandardMaterial map={tex} />;
}

/** <LightReveal> — candle press lifts the scene by ramping exposure + env, not a black overlay. */
function LightReveal({ lit, instant }: { lit: boolean; instant: boolean }) {
  const { gl, scene } = useThree();
  const done = useRef(false);
  useFrame(() => {
    const targetExp = lit ? 1.05 : 0.3;
    const targetEnv = lit ? 0.4 : 0.06;
    if (instant && !done.current) {
      gl.toneMappingExposure = targetExp;
      scene.environmentIntensity = targetEnv;
      done.current = true;
      return;
    }
    gl.toneMappingExposure = THREE.MathUtils.lerp(gl.toneMappingExposure, targetExp, 0.035);
    scene.environmentIntensity = THREE.MathUtils.lerp(scene.environmentIntensity ?? 0.05, targetEnv, 0.035);
  });
  return null;
}

/** Locked near-top-down camera with gentle clamped pointer parallax. */
function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera, pointer } = useThree();
  useFrame(() => {
    const px = reduced ? 0 : pointer.x;
    const py = reduced ? 0 : pointer.y;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, px * 0.22, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3.55 + py * 0.12, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 2.05, 0.04);
    camera.lookAt(0, 0, -0.05);
  });
  return null;
}

export function Desk3DScene({
  lit,
  instant,
  reduced,
  onCandleClick,
}: {
  lit: boolean;
  instant: boolean;
  reduced: boolean;
  onCandleClick: () => void;
}) {
  // debug flags (spike only): ?min=1 bare scene · noenv=1 · noshadow=1 · fx=0 · dof=0
  const q = typeof location !== "undefined" ? location.search : "";
  const flags = {
    min: new URLSearchParams(q).get("min"),
    noenv: q.includes("noenv=1"),
    noshadow: q.includes("noshadow=1"),
    nofx: q.includes("fx=0"),
    nodof: q.includes("dof=0"),
    nocs: q.includes("nocs=1"),
    only: new URLSearchParams(q).get("only"), // slab | slabflame | objects
  };
  return (
    <Canvas
      shadows={flags.noshadow ? false : "soft"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 3.55, 2.05], fov: 35 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.14 }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color("#0d0805");
        scene.fog = new THREE.Fog("#0d0805", 5.5, 9.5);
      }}
    >
      {/* debug: ?min=1 bare sanity scene · ?min=2 same + one raw texture */}
      {flags.min ? (
        <>
          <ambientLight intensity={2} />
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            {flags.min === "2" ? <MinTexturedMaterial /> : <meshStandardMaterial color="orange" />}
          </mesh>
        </>
      ) : flags.only === "slab" ? (
        <>
          <ambientLight intensity={1.5} />
          <DeskSlab />
        </>
      ) : flags.only === "slabflame" ? (
        <>
          <hemisphereLight args={["#3a2a1c", "#14100b", 0.4]} />
          <LightReveal lit={lit} instant={instant} />
          <CandleFlame position={FLAME_POS} lit={lit} />
          <DeskSlab />
        </>
      ) : (
        <>
      {!flags.noenv && <Environment files="/assets/hdri/artist_workshop_1k.hdr" environmentIntensity={0.05} />}
      {/* whisper of warm fill so shadow sides never crush to pure black */}
      <hemisphereLight args={["#3a2a1c", "#14100b", 0.25]} />
      <LightReveal lit={lit} instant={instant} />
      <CameraRig reduced={reduced} />
      <CandleFlame position={FLAME_POS} lit={lit} />

      <DeskSlab />

      {/* the candle is the switch */}
      <group
        position={[-1.7, 0, -0.75]}
        onClick={(e) => { e.stopPropagation(); onCandleClick(); }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <Candle />
      </group>

      <DeskObject3D label="Writings" route="/writings" lit={lit} position={[-1.35, 0, 0.18]} rotation={[0, 0.14, 0]} captionOffset={[0, 0.05, 0.52]}>
        <Notebook scale={2.1} rotation={[0, Math.PI / 2 + 0.1, 0]} />
      </DeskObject3D>

      <DeskObject3D label="Technical Builds" route="/builds" lit={lit} position={[0, 0, -0.05]} captionOffset={[0, 0.05, 0.72]}>
        <Macbook />
      </DeskObject3D>

      <DeskObject3D label="Work & Ventures" route="/work" lit={lit} position={[0.22, 0, 0.95]} rotation={[0, -0.06, 0]} captionOffset={[0, 0.04, 0.55]}>
        <Folder />
      </DeskObject3D>

      <DeskObject3D label="About Me" route="/about" lit={lit} position={[1.82, 0, -1.0]} rotation={[0, -0.18, 0]} captionOffset={[0, 0.04, 0.28]}>
        <PostIt lines={["about", "me"]} />
      </DeskObject3D>

      <DeskObject3D label="Video" route="/video" lit={lit} position={[1.58, 0, 0.42]} captionOffset={[0, 0.02, 0.5]}>
        <Phone />
      </DeskObject3D>

      {/* ambiance (not clickable) */}
      <group position={[1.12, 0, -0.5]}><Papers /></group>
      <group position={[-1.15, 0, -0.42]}><Pens /></group>
      <group position={[-0.55, 0, 0.78]}>
        <PostIt lines={["actions >", "words"]} tint="#e3c057" />
      </group>
      <group position={[-1.62, 0, 0.95]}><Books /></group>

      {!flags.nocs && (
        <ContactShadows position={[0, 0.002, 0]} opacity={0.62} scale={7} blur={2.2} far={1.2} resolution={512} color="#140b05" />
      )}
        </>
      )}

      {!flags.min && !flags.nofx && (
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.85} luminanceSmoothing={0.2} />
          {!flags.nodof ? (
            <DepthOfField focusDistance={0.02} focalLength={0.06} bokehScale={2.2} />
          ) : (
            <></>
          )}
          <Vignette eskil={false} offset={0.18} darkness={0.78} />
          <Noise premultiply opacity={0.055} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
