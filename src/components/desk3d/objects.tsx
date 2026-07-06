"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useGLTF, Html } from "@react-three/drei";
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

/* ---------- GLTF notebook (Poly Haven, CC0) ---------- */

export function Notebook(props: { scale?: number; rotation?: [number, number, number] }) {
  const { scene } = useGLTF("/assets/models/binder_notebook/binder_notebook_1k.gltf");
  const cloned = useMemo(() => {
    const s = scene.clone(true);
    s.traverse((o) => {
      if (o instanceof THREE.Mesh) { o.castShadow = true; o.receiveShadow = true; }
    });
    return s;
  }, [scene]);
  return <primitive object={cloned} {...props} />;
}
useGLTF.preload("/assets/models/binder_notebook/binder_notebook_1k.gltf");

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

/* ---------- post-its ---------- */

export function PostIt({ lines, tint }: { lines: string[]; tint?: string }) {
  const tex = useMemo(() => handwritingTexture(lines, tint ? { bg: tint } : {}), [lines, tint]);
  return (
    <mesh castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0.1]} position={[0, 0.003, 0]}>
      <planeGeometry args={[0.24, 0.24]} />
      <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
    </mesh>
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

export function Pens() {
  return (
    <group>
      {([{ c: "#2d2622", z: 0, r: 0.1 }, { c: "#4a3d33", z: 0.06, r: -0.06 }, { c: "#b89a6e", z: 0.12, r: 0.02 }] as const).map((p, i) => (
        <mesh key={i} castShadow receiveShadow rotation={[0, p.r + Math.PI / 2.2, Math.PI / 2]} position={[0, 0.012, p.z]}>
          <cylinderGeometry args={[0.011, 0.011, 0.5, 12]} />
          <meshStandardMaterial color={p.c} roughness={0.35} metalness={0.35} />
        </mesh>
      ))}
    </group>
  );
}
