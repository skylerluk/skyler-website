"use client";

/* eslint-disable react-hooks/immutability --
   useFrame callbacks run per-frame outside render; mutating three.js objects
   (camera, renderer exposure, scene env) there is the R3F idiom. */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html } from "@react-three/drei";
import { CandleFlame } from "./CandleFlame";
import {
  Books, Candle, DeskMat, DeskObject3D, DeskSlab, EthosCard, Folder, Macbook, Notebook, Papers, Pens,
  type SceneFocus,
} from "./objects";
import { SocialButton3D } from "./socials";
import { githubMarkSvg, linkedinMarkSvg } from "./decals";

// NOTE: the @react-three/postprocessing EffectComposer was removed. On some
// GPUs (reproduced on Apple M-series via ANGLE Metal) routing the scene through
// the composer's render target banded the smooth candlelight falloff into
// blocky rectangles across the desk — present with ANY effect, and even
// bloom-only. The cinematic grade is now done reliably: the candle glows via
// its own additive shader flame + halo, and vignette + film grain are CSS
// overlays (see DeskHome3D). ACES tone mapping + the exposure reveal stay on
// the renderer, not the composer.

const FLAME_POS: [number, number, number] = [-2.0, 0.5, -1.3];
const FOCUS_HOME = new THREE.Vector3(0, 0.05, -0.1);

type RevealState = { lit: boolean; instant: boolean; reduced: boolean };

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
    // dim intro lifted from near-black so the candle + desk read while finding the switch
    const targetExp = lit ? 1.18 : 0.5;
    const targetEnv = lit ? 0.85 : 0.12;
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

// deterministic PRNG so mote seeding is pure (and stable across renders)
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sparse dust motes drifting through the candle's light pool. */
function DustMotes({ reveal }: { reveal: React.RefObject<RevealState> }) {
  const COUNT = 64;
  const pts = useRef<THREE.Points>(null);
  const seeds = useMemo(() => {
    const rnd = mulberry32(20260708);
    // confined to the air column above the candle's pool, clear of the laptop
    return Array.from({ length: COUNT }, () => ({
      x: -2.4 + rnd() * 1.6,
      y: 0.15 + rnd() * 1.2,
      z: -1.6 + rnd() * 1.7,
      s: 0.01 + rnd() * 0.025,
      p: rnd() * Math.PI * 2,
    }));
  }, []);
  const positions = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    seeds.forEach((sd, i) => a.set([sd.x, sd.y, sd.z], i * 3));
    return a;
  }, [seeds]);
  useFrame(({ clock }) => {
    if (!pts.current) return;
    const mat = pts.current.material as THREE.PointsMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, reveal.current?.lit ? 0.32 : 0, 0.03);
    if (reveal.current?.reduced) return; // motes hold still under reduced motion
    const t = clock.elapsedTime;
    const arr = pts.current.geometry.attributes.position.array as Float32Array;
    seeds.forEach((sd, i) => {
      arr[i * 3] = sd.x + Math.sin(t * 0.22 + sd.p) * 0.09;
      arr[i * 3 + 1] = 0.15 + ((sd.y + t * sd.s) % 1.2);
      arr[i * 3 + 2] = sd.z + Math.cos(t * 0.18 + sd.p) * 0.09;
    });
    pts.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={pts} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.009}
        color="#ffd9a3"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/** Locked near-top-down camera with gentle clamped pointer parallax.
 *  Narrow (portrait) viewports re-aim at the candle and widen the fov so the
 *  switch stays in frame on phones. */
function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera, pointer, size } = useThree();
  useFrame(() => {
    const narrow = size.width / size.height < 0.8;
    const px = reduced ? 0 : pointer.x;
    const py = reduced ? 0 : pointer.y;
    const cam = camera as THREE.PerspectiveCamera;
    const fov = narrow ? 52 : 34;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, (narrow ? -0.7 : 0) + px * 0.22, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 5.35 + py * 0.14, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 3.5, 0.04);
    camera.lookAt(narrow ? -0.7 : 0, 0, -0.02);
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
    nocs: q.includes("nocs=1"),
    only: new URLSearchParams(q).get("only"), // slab | slabflame | objects
  };

  // mutable reveal + focus state read per-frame by the scene (flame lean,
  // hover focus, exposure reveal)
  const revealRef = useRef<RevealState>({ lit, instant, reduced });
  useEffect(() => {
    revealRef.current = { lit, instant, reduced };
  }, [lit, instant, reduced]);
  const focusRef = useRef<SceneFocus>({ hovered: false, point: FOCUS_HOME.clone() });

  return (
    <Canvas
      shadows={flags.noshadow ? false : "soft"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 5.35, 3.5], fov: 34 }}
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
      {/* fill: cool sky over warm ground — warm key (the candle), subtly cool
          shadows. Lifted just enough that the far side of the desk keeps form. */}
      <hemisphereLight args={["#41505f", "#2a1c10", 0.72]} />
      <LightReveal lit={lit} instant={instant} />
      <CameraRig reduced={reduced} />
      <CandleFlame position={FLAME_POS} lit={lit} instant={instant} reduced={reduced} focus={focusRef} />
      <DustMotes reveal={revealRef} />

      <DeskSlab />
      <DeskMat />

      {/* the candle is the switch — fully off the mat, in the back-left corner */}
      <group
        position={[-2.0, 0, -1.3]}
        onClick={(e) => { e.stopPropagation(); onCandleClick(); }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <Candle />
        {/* prompt anchored directly under the candle so it's centred on it at any
            window size — shown only before the candle is lit */}
        {!lit && (
          <Html center position={[0, 0.02, 0.55]} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
            <span className="caption whitespace-nowrap" style={{ opacity: 0.85 }}>light the candle</span>
          </Html>
        )}
      </group>

      {/* the four interactive objects sit ON the leather mat, raised clearly above
          it (y ≈ 0.06) so they cast a grounding shadow and separate from the mat */}
      <DeskObject3D label="Writings" route="/writings" lit={lit} focus={focusRef} position={[-1.05, 0.06, 0.05]} rotation={[0, 0.14, 0]} captionOffset={[0, 0.05, 0.61]}>
        <Notebook />
      </DeskObject3D>

      <DeskObject3D label="Technical Builds" route="/builds" lit={lit} focus={focusRef} position={[0.1, 0.06, -0.38]} captionOffset={[0, 0.05, 0.58]}>
        <Macbook />
      </DeskObject3D>

      {/* folder moved to the right, into the space freed by removing the phone */}
      <DeskObject3D label="Work & Ventures" route="/work" lit={lit} focus={focusRef} position={[1.34, 0.06, 0.12]} rotation={[0, -0.1, 0]} captionOffset={[0, 0.04, 0.52]}>
        <Folder />
      </DeskObject3D>

      {/* loose papers (About Me) — dropped further down into the extended mat area */}
      <DeskObject3D label="About Me" route="/about" lit={lit} focus={focusRef} position={[0.2, 0.06, 0.95]} rotation={[0, -0.05, 0]} captionOffset={[0, 0.04, 0.53]}>
        <Papers />
      </DeskObject3D>

      {/* ambiance (not clickable) */}
      <group position={[-1.15, 0.06, -0.5]}><Pens /></group>
      {/* the ethos card — off the mat, on the walnut behind it, over toward the candle */}
      <group position={[-1.05, 0, -1.4]} rotation={[0, 0.16, 0]}><EthosCard /></group>
      {/* books — fully off the mat, square, on the walnut to its left */}
      <group position={[-2.18, 0, -0.1]} rotation={[0, 0.1, 0]}><Books /></group>

      {/* social buttons — small matte machined objects on the walnut past the
          mat's top-right corner (off the mat), angled a touch toward the camera
          so the candle highlight grazes the bevels */}
      {lit && (
        <>
          <SocialButton3D
            href="https://github.com/skylerluk"
            label="GitHub"
            bodyTint="#0e0e0f"
            glyphSvg={githubMarkSvg}
            reduced={reduced}
            position={[1.98, 0, -0.62]}
            rotation={[0, -0.52, 0]}
          />
          <SocialButton3D
            href="https://www.linkedin.com/in/skylerluk/"
            label="LinkedIn"
            bodyTint="#0a4f9c"
            glyphSvg={linkedinMarkSvg}
            glossy
            reduced={reduced}
            position={[2.32, 0, -0.36]}
            rotation={[0, -0.52, 0]}
          />
        </>
      )}

      {!flags.nocs && (
        <ContactShadows position={[0, 0.002, 0]} opacity={0.72} scale={7} blur={1.9} far={1.1} resolution={1024} color="#120a04" />
      )}
        </>
      )}
    </Canvas>
  );
}
