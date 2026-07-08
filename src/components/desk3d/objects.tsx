"use client";

/* eslint-disable react-hooks/immutability --
   useFrame callbacks and pointer handlers mutate three.js objects and shared
   mutable refs (the R3F idiom); nothing here mutates during render. */

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Html } from "@react-three/drei";
import { BrushedAluminum, OakWood, PaperMaterial, WaxMaterial } from "./materials";
import { appleLogoAlpha, bookCoverTexture, handwritingTexture, videoScreenTexture } from "./decals";

/* ---------- interactive wrapper: raycast hover lift + route ---------- */

/** Shared mutable state the scene reads per-frame: what's hovered and where
 *  the depth-of-field should rack. Plain object, mutated outside render. */
export type SceneFocus = { hovered: boolean; point: THREE.Vector3 };

export function DeskObject3D({
  label,
  route,
  lit,
  children,
  captionOffset = [0, 0, 0.55] as [number, number, number],
  position,
  rotation = [0, 0, 0] as [number, number, number],
  focus,
}: {
  label: string;
  route: string;
  lit: boolean;
  children: React.ReactNode;
  captionOffset?: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  focus?: React.RefObject<SceneFocus>;
}) {
  const router = useRouter();
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);

  useFrame(() => {
    if (!group.current) return;
    const targetY = position[1] + (hover && lit ? 0.035 : 0);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.14);
  });

  const setHovered = (v: boolean) => {
    setHover(v);
    if (!focus?.current) return;
    focus.current.hovered = v;
    if (v) focus.current.point.set(position[0], position[1] + 0.05, position[2]);
  };

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); if (lit) { setHovered(true); document.body.style.cursor = "pointer"; } }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
      onClick={(e) => { e.stopPropagation(); if (lit) router.push(route); }}
    >
      {children}
      {lit && (
        <Html
          center
          position={captionOffset}
          zIndexRange={[15, 0]}
          wrapperClass="hidden md:block"
          // resting scene stays calm and photographic: labels appear on hover
          style={{ pointerEvents: "none", opacity: hover ? 1 : 0, transition: "opacity .35s" }}
        >
          <span className="caption whitespace-nowrap">{label}</span>
        </Html>
      )}
    </group>
  );
}

/* ---------- the desk slab ---------- */

export function DeskSlab() {
  return (
    <mesh receiveShadow position={[0, -0.06, 0]}>
      <boxGeometry args={[8.5, 0.12, 5.4]} />
      <OakWood repeat={[3.1, 1.95]} />
    </mesh>
  );
}

/* ---------- MacBook: closed clamshell, brushed aluminum, flipped logo ---------- */

export function Macbook() {
  const logo = useMemo(() => appleLogoAlpha(512), []);
  return (
    <group>
      {/* base */}
      <RoundedBox args={[1.28, 0.045, 0.9]} radius={0.02} smoothness={4} castShadow receiveShadow position={[0, 0.0225, 0]}>
        <BrushedAluminum />
      </RoundedBox>
      {/* seam */}
      <mesh position={[0, 0.047, 0]}>
        <boxGeometry args={[1.27, 0.004, 0.89]} />
        <meshStandardMaterial color="#141210" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* closed lid */}
      <RoundedBox args={[1.28, 0.022, 0.9]} radius={0.011} smoothness={4} castShadow receiveShadow position={[0, 0.062, 0]}>
        <BrushedAluminum tint="#d6cfc4" />
      </RoundedBox>
      {/* etched logo — rotated 180° so it reads upside-down from the seat (correct);
          mirror-filled so it glints as the candle highlight moves */}
      <mesh position={[0, 0.0735, 0.02]} rotation={[-Math.PI / 2, 0, Math.PI]}>
        <planeGeometry args={[0.17, 0.2]} />
        <meshStandardMaterial
          alphaMap={logo}
          transparent
          color="#33333a"
          metalness={1}
          roughness={0.05}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
      {/* rubber feet hint */}
      {([[-0.56, -0.38], [0.56, -0.38], [-0.56, 0.38], [0.56, 0.38]] as const).map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.004, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.008, 12]} />
          <meshStandardMaterial color="#1a1815" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- candle: wax + brass dish + wick ---------- */

export function Candle() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.02, 32]} />
        <meshStandardMaterial color="#8a6a3a" metalness={1} roughness={0.32} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.245, 0]}>
        <cylinderGeometry args={[0.105, 0.115, 0.45, 32]} />
        <WaxMaterial />
      </mesh>
      {/* melted rim */}
      <mesh position={[0, 0.472, 0]}>
        <torusGeometry args={[0.1, 0.012, 10, 32]} />
        <WaxMaterial />
      </mesh>
      <mesh position={[0, 0.485, 0]}>
        <cylinderGeometry args={[0.004, 0.005, 0.035, 8]} />
        <meshStandardMaterial color="#241a12" roughness={1} />
      </mesh>
    </group>
  );
}

/* ---------- closed composition notebook ---------- */

export function Notebook() {
  return (
    <group>
      {/* page block: only the fore-edge peeks out below the cover */}
      <mesh castShadow receiveShadow position={[0.01, 0.032, 0]}>
        <boxGeometry args={[0.67, 0.05, 0.9]} />
        <PaperMaterial tint="#e7dcc2" repeat={[2, 0.4]} />
      </mesh>
      {/* covers — matte so they don't mirror the environment */}
      <RoundedBox args={[0.7, 0.014, 0.96]} radius={0.007} smoothness={4} castShadow receiveShadow position={[0, 0.062, 0]}>
        <meshStandardMaterial color="#332a20" roughness={0.85} envMapIntensity={0.35} />
      </RoundedBox>
      <RoundedBox args={[0.7, 0.014, 0.96]} radius={0.007} smoothness={4} castShadow receiveShadow position={[0, 0.007, 0]}>
        <meshStandardMaterial color="#2a211a" roughness={0.85} envMapIntensity={0.35} />
      </RoundedBox>
      {/* spine */}
      <mesh castShadow position={[-0.345, 0.036, 0]}>
        <boxGeometry args={[0.018, 0.068, 0.96]} />
        <meshStandardMaterial color="#171310" roughness={0.85} envMapIntensity={0.3} />
      </mesh>
      {/* elastic strap wrapped over the top cover */}
      <mesh position={[0.2, 0.037, 0]}>
        <boxGeometry args={[0.022, 0.072, 0.962]} />
        <meshStandardMaterial color="#221b15" roughness={0.9} envMapIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* ---------- phone, propped ---------- */

export function Phone() {
  const screen = useMemo(() => videoScreenTexture(), []);
  return (
    <group rotation={[0, 0.16, 0]}>
      {/* leaning back ~25°, propped from BEHIND (kickstand faces away from camera) */}
      <group position={[0, 0.15, 0]} rotation={[-0.44, 0, 0]}>
        <RoundedBox args={[0.34, 0.7, 0.024]} radius={0.014} smoothness={4} castShadow>
          <meshPhysicalMaterial color="#14100c" metalness={0.4} roughness={0.32} clearcoat={0.9} clearcoatRoughness={0.12} />
        </RoundedBox>
        {/* lit screen: paused video with a play glyph */}
        <mesh position={[0, 0, 0.0135]}>
          <planeGeometry args={[0.315, 0.665]} />
          <meshPhysicalMaterial
            map={screen}
            emissiveMap={screen}
            emissive="#ffffff"
            emissiveIntensity={0.85}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
        {/* kickstand: hinged off the back, angled down to the desk */}
        <mesh castShadow position={[0, -0.1, -0.055]} rotation={[0.75, 0, 0]}>
          <boxGeometry args={[0.14, 0.3, 0.01]} />
          <meshStandardMaterial color="#1c1712" roughness={0.65} metalness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- manila folder ---------- */

export function Folder() {
  return (
    <group>
      <RoundedBox args={[1.05, 0.012, 0.78]} radius={0.006} castShadow receiveShadow position={[0, 0.012, 0]}>
        <PaperMaterial tint="#b59464" roughness={0.95} />
      </RoundedBox>
      {/* tab */}
      <mesh castShadow position={[-0.32, 0.019, -0.365]}>
        <boxGeometry args={[0.3, 0.008, 0.07]} />
        <PaperMaterial tint="#b59464" roughness={0.95} />
      </mesh>
      {/* sheets peeking out, slightly fanned */}
      <mesh castShadow position={[0.035, 0.021, 0.03]} rotation={[0, 0.025, 0]}>
        <boxGeometry args={[1.0, 0.005, 0.73]} />
        <PaperMaterial tint="#e9dfc6" />
      </mesh>
      <mesh position={[0.05, 0.026, 0.045]} rotation={[0, -0.02, 0]}>
        <boxGeometry args={[0.98, 0.003, 0.71]} />
        <PaperMaterial tint="#efe6d2" />
      </mesh>
      {/* top cover, hinged open a few degrees at the spine */}
      <RoundedBox args={[1.05, 0.012, 0.78]} radius={0.006} castShadow receiveShadow position={[0, 0.055, -0.015]} rotation={[0.11, 0, 0.004]}>
        <PaperMaterial tint="#b59464" roughness={0.95} />
      </RoundedBox>
    </group>
  );
}

/* ---------- loose papers ---------- */

export function Papers() {
  return (
    <group>
      <mesh receiveShadow castShadow rotation={[-Math.PI / 2, 0, 0.12]} position={[0, 0.004, 0]}>
        <planeGeometry args={[0.58, 0.8]} />
        <PaperMaterial tint="#e6dcc0" />
      </mesh>
      {/* top sheet lifts at one edge — a slight curl that catches a shadow */}
      <mesh receiveShadow castShadow rotation={[-Math.PI / 2 + 0.06, 0.01, -0.07]} position={[0.06, 0.018, -0.03]}>
        <planeGeometry args={[0.58, 0.8]} />
        <PaperMaterial tint="#ece2c9" />
      </mesh>
    </group>
  );
}

/* ---------- propped ethos card: "Actions > words" ---------- */

export function EthosCard() {
  const tex = useMemo(
    () =>
      handwritingTexture(["Actions", "> words"], {
        bg: "#efe5cd",
        ink: "#2e241d",
        width: 512,
        height: 320,
        fontFrac: 0.24,
      }),
    [],
  );
  return (
    <group>
      {/* card face, leaning back like a tent card */}
      <mesh castShadow position={[0, 0.16, 0]} rotation={[-0.18, 0, 0.015]}>
        <planeGeometry args={[0.52, 0.33]} />
        <meshStandardMaterial map={tex} roughness={0.92} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      {/* folded back panel that props it up */}
      <mesh castShadow position={[0, 0.155, -0.09]} rotation={[0.62, 0, 0.015]}>
        <planeGeometry args={[0.52, 0.34]} />
        <meshStandardMaterial color="#e2d6ba" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ---------- ambiance: books + pens ---------- */

/** A single worn hardcover: cover texture on top, page block, creased spine. */
function Book({
  size,
  color,
  cover,
}: {
  size: [number, number, number]; // w(spine→fore-edge), h, d
  color: string;
  cover: THREE.Texture;
}) {
  const [w, h, d] = size;
  return (
    <group>
      <RoundedBox args={[w, h, d]} radius={0.008} castShadow receiveShadow position={[0, h / 2, 0]}>
        <meshStandardMaterial color={color} roughness={0.72} />
      </RoundedBox>
      {/* page block showing at the fore-edge and ends */}
      <mesh position={[0.012, h / 2, 0]}>
        <boxGeometry args={[w - 0.035, h - 0.024, d - 0.02]} />
        <PaperMaterial tint="#e3d8ba" repeat={[2, 0.3]} />
      </mesh>
      {/* titled top board — reads from the camera */}
      <mesh position={[0, h + 0.001, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[d * 0.98, w * 0.98]} />
        <meshStandardMaterial map={cover} roughness={0.68} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
    </group>
  );
}

/** The only easter egg: Self-Reliance and Meditations, genuinely used. */
export function Books() {
  const selfReliance = useMemo(
    () => bookCoverTexture("Self-Reliance", "R. W. Emerson", { bg: "#5c4a33" }),
    [],
  );
  const meditations = useMemo(
    () => bookCoverTexture("Meditations", "Marcus Aurelius", { bg: "#6e392c" }),
    [],
  );
  return (
    <group>
      {/* side by side with a lazy overlap so both titles read */}
      <group rotation={[0, 0.09, 0]}>
        <Book size={[0.62, 0.075, 0.44]} color="#4e3d29" cover={selfReliance} />
      </group>
      <group position={[0.52, 0, 0.2]} rotation={[0, -0.32, 0]}>
        <Book size={[0.56, 0.062, 0.4]} color="#5e2f24" cover={meditations} />
      </group>
    </group>
  );
}

function Pen({ body, tip, metal = false }: { body: string; tip: string; metal?: boolean }) {
  return (
    <group>
      {/* barrel */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.014, 0.014, 0.42, 16]} />
        <meshStandardMaterial color={body} roughness={metal ? 0.3 : 0.42} metalness={metal ? 0.85 : 0.15} />
      </mesh>
      {/* tapered nose cone */}
      <mesh castShadow position={[0, -0.235, 0]}>
        <cylinderGeometry args={[0.013, 0.004, 0.05, 16]} />
        <meshStandardMaterial color="#8f8072" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* tip */}
      <mesh position={[0, -0.264, 0]}>
        <cylinderGeometry args={[0.0035, 0.0015, 0.012, 8]} />
        <meshStandardMaterial color={tip} roughness={0.25} metalness={0.8} />
      </mesh>
      {/* end cap */}
      <mesh castShadow position={[0, 0.214, 0]}>
        <sphereGeometry args={[0.014, 12, 8]} />
        <meshStandardMaterial color={body} roughness={0.4} metalness={metal ? 0.85 : 0.15} />
      </mesh>
      {/* clip */}
      <mesh castShadow position={[0.015, 0.16, 0]}>
        <boxGeometry args={[0.005, 0.09, 0.008]} />
        <meshStandardMaterial color="#a5947e" roughness={0.28} metalness={0.95} />
      </mesh>
    </group>
  );
}

export function Pens() {
  // two pens and a pencil, laid at easy angles — resting flat on the desk
  return (
    <group>
      <group position={[0, 0.015, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2.3]}>
        <Pen body="#26201b" tip="#3b3b3d" />
      </group>
      <group position={[0.05, 0.015, 0.07]} rotation={[Math.PI / 2, 0, Math.PI / 2.12]}>
        <Pen body="#8d7f6d" tip="#2a2a2c" metal />
      </group>
      {/* pencil: hex-ish barrel, wood cone, graphite tip */}
      <group position={[-0.04, 0.014, 0.14]} rotation={[Math.PI / 2, 0, Math.PI / 2.5]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.4, 6]} />
          <meshStandardMaterial color="#c9a86a" roughness={0.6} metalness={0} />
        </mesh>
        <mesh castShadow position={[0, -0.225, 0]}>
          <cylinderGeometry args={[0.011, 0.002, 0.05, 12]} />
          <meshStandardMaterial color="#e0cfa8" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.253, 0]}>
          <cylinderGeometry args={[0.002, 0.0005, 0.01, 8]} />
          <meshStandardMaterial color="#2b2b2e" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
