"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Html } from "@react-three/drei";
import { BrushedAluminum, OakWood, PaperMaterial, WaxMaterial } from "./materials";
import { appleLogoAlpha, handwritingTexture } from "./decals";

/* ---------- interactive wrapper: raycast hover lift + route ---------- */

export function DeskObject3D({
  label,
  route,
  lit,
  children,
  captionOffset = [0, 0, 0.55] as [number, number, number],
  position,
  rotation = [0, 0, 0] as [number, number, number],
}: {
  label: string;
  route: string;
  lit: boolean;
  children: React.ReactNode;
  captionOffset?: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const router = useRouter();
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);

  useFrame(() => {
    if (!group.current) return;
    const targetY = position[1] + (hover && lit ? 0.035 : 0);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.14);
  });

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); if (lit) { setHover(true); document.body.style.cursor = "pointer"; } }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = "auto"; }}
      onClick={(e) => { e.stopPropagation(); if (lit) router.push(route); }}
    >
      {children}
      {lit && (
        <Html
          center
          position={captionOffset}
          zIndexRange={[15, 0]}
          wrapperClass="hidden md:block"
          style={{ pointerEvents: "none", opacity: hover ? 1 : 0.72, transition: "opacity .3s" }}
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
      <OakWood repeat={[3.4, 2.2]} />
    </mesh>
  );
}

/* ---------- MacBook: closed clamshell, brushed aluminum, flipped logo ---------- */

export function Macbook() {
  const logo = useMemo(() => appleLogoAlpha(), []);
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
      {/* etched logo — rotated 180° so it reads upside-down from the seat (correct) */}
      <mesh position={[0, 0.0735, 0.02]} rotation={[-Math.PI / 2, 0, Math.PI]}>
        <planeGeometry args={[0.17, 0.2]} />
        <meshStandardMaterial
          alphaMap={logo}
          transparent
          color="#3a3a3c"
          metalness={1}
          roughness={0.12}
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
      {/* page block, slightly inset so cream edges show on three sides */}
      <mesh castShadow receiveShadow position={[0.012, 0.042, 0]}>
        <boxGeometry args={[0.66, 0.07, 0.92]} />
        <PaperMaterial tint="#e7dcc2" repeat={[2, 0.4]} />
      </mesh>
      {/* covers */}
      <RoundedBox args={[0.7, 0.014, 0.96]} radius={0.007} smoothness={4} castShadow receiveShadow position={[0, 0.088, 0]}>
        <meshStandardMaterial color="#33291f" roughness={0.55} />
      </RoundedBox>
      <RoundedBox args={[0.7, 0.014, 0.96]} radius={0.007} smoothness={4} castShadow receiveShadow position={[0, 0.007, 0]}>
        <meshStandardMaterial color="#2a211a" roughness={0.55} />
      </RoundedBox>
      {/* spine */}
      <mesh castShadow position={[-0.345, 0.048, 0]}>
        <boxGeometry args={[0.02, 0.096, 0.96]} />
        <meshStandardMaterial color="#12100d" roughness={0.5} />
      </mesh>
      {/* elastic strap */}
      <mesh position={[0.2, 0.049, 0]}>
        <boxGeometry args={[0.022, 0.1, 0.965]} />
        <meshStandardMaterial color="#2c241d" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ---------- phone, propped ---------- */

export function Phone() {
  return (
    <group rotation={[0, 0.16, 0]}>
      {/* propped against a low stand: leaning back ~25° */}
      <group position={[0, 0.15, 0]} rotation={[-0.44, 0, 0]}>
        <RoundedBox args={[0.34, 0.7, 0.024]} radius={0.014} smoothness={4} castShadow>
          <meshPhysicalMaterial color="#14100c" metalness={0.4} roughness={0.32} clearcoat={0.9} clearcoatRoughness={0.12} />
        </RoundedBox>
      </group>
      {/* stand wedge */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0.12]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.16, 0.02, 0.22]} />
        <meshStandardMaterial color="#2a221a" roughness={0.7} />
      </mesh>
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
      {/* sheets peeking out */}
      <mesh position={[0.02, 0.021, 0.01]}>
        <boxGeometry args={[1.0, 0.005, 0.73]} />
        <PaperMaterial tint="#efe6d2" />
      </mesh>
      <RoundedBox args={[1.05, 0.012, 0.78]} radius={0.006} castShadow receiveShadow position={[0, 0.031, 0.012]} rotation={[0.012, 0, 0]}>
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
        <PaperMaterial />
      </mesh>
      <mesh receiveShadow castShadow rotation={[-Math.PI / 2, 0, -0.07]} position={[0.06, 0.008, -0.03]}>
        <planeGeometry args={[0.58, 0.8]} />
        <PaperMaterial tint="#f2ead8" />
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

export function Books() {
  return (
    <group>
      <RoundedBox args={[0.62, 0.075, 0.42]} radius={0.008} castShadow receiveShadow position={[0, 0.0375, 0]} rotation={[0, 0.09, 0]}>
        <meshStandardMaterial color="#5a3a2e" roughness={0.6} />
      </RoundedBox>
      <mesh position={[0.01, 0.0375, 0]} rotation={[0, 0.09, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.4]} />
        <PaperMaterial tint="#e6dcc4" repeat={[2, 0.3]} />
      </mesh>
      <RoundedBox args={[0.56, 0.06, 0.38]} radius={0.008} castShadow receiveShadow position={[-0.03, 0.105, 0.02]} rotation={[0, -0.14, 0]}>
        <meshStandardMaterial color="#8a6a3c" roughness={0.55} />
      </RoundedBox>
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
