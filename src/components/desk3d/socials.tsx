"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Html } from "@react-three/drei";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { SatinMetal } from "./materials";

/** Parse an SVG mark into a centred, normalised extruded geometry — the glyph
 *  raised in real relief (small bevel), sized to `size` on the button's top
 *  face. SVG's y-axis points down, so we flip y to keep the mark upright. */
function useGlyphGeometry(svg: string, size: number, depth: number) {
  return useMemo(() => {
    const paths = new SVGLoader().parse(svg).paths;
    const shapes: THREE.Shape[] = [];
    for (const p of paths) for (const s of SVGLoader.createShapes(p)) shapes.push(s);
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth,
      bevelEnabled: true,
      bevelThickness: depth * 0.35,
      bevelSize: depth * 0.28,
      bevelSegments: 2,
      curveSegments: 12,
    });
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const w = bb.max.x - bb.min.x;
    const h = bb.max.y - bb.min.y;
    const s = size / Math.max(w, h);
    geo.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, 0);
    geo.scale(s, -s, s); // flip y: SVG is y-down
    return geo;
  }, [svg, size, depth]);
}

/**
 * <SocialButton3D> — a small matte machined button resting on the desk that
 * opens an external profile in a new tab. NOT a DeskObject3D (those router.push
 * to internal routes). Hover lifts + scales it a touch; click / Enter / Space
 * open the link. Focus + activation are handled by a real <a> in DeskHome3D.
 */
export function SocialButton3D({
  href,
  label,
  bodyTint,
  glyphSvg,
  glossy = false,
  reduced = false,
  size = 1,
  position,
  rotation = [0, 0, 0],
}: {
  href: string;
  label: string;
  bodyTint: string;
  glyphSvg: string;
  glossy?: boolean;
  reduced?: boolean;
  size?: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);

  // scale every dimension by `size`, keeping the body resting on the desk top
  const DESK_TOP = 0.055;
  const bodyW = 0.4 * size;
  const bodyH = 0.11 * size;
  const bodyCenterY = DESK_TOP + bodyH / 2;
  const topFaceY = DESK_TOP + bodyH;
  const glyph = useGlyphGeometry(glyphSvg, 0.17 * size, 0.022 * size);

  useFrame(() => {
    if (!group.current) return;
    const targetY = position[1] + (hover && !reduced ? 0.03 : 0);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.14);
    const targetS = hover && !reduced ? 1.05 : 1;
    const s = THREE.MathUtils.lerp(group.current.scale.x, targetS, 0.14);
    group.current.scale.setScalar(s);
  });

  const open = () => window.open(href, "_blank", "noopener,noreferrer");

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = "auto"; }}
      onClick={(e) => { e.stopPropagation(); open(); }}
    >
      {/* soft rounded-square body — matte satin metal, GitHub black / LinkedIn blue */}
      <RoundedBox
        args={[bodyW, bodyH, bodyW]}
        radius={0.05 * size}
        smoothness={8}
        castShadow
        receiveShadow
        position={[0, bodyCenterY, 0]}
      >
        <SatinMetal tint={bodyTint} glossy={glossy} />
      </RoundedBox>
      {/* the mark, extruded into relief on the top face (white, low-ish roughness) */}
      <mesh geometry={glyph} position={[0, topFaceY, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <meshPhysicalMaterial color="#f4f2ee" roughness={0.34} metalness={0} clearcoat={0.2} clearcoatRoughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <Html
        center
        position={[0, topFaceY + 0.03, 0.42 * size]}
        zIndexRange={[15, 0]}
        wrapperClass="hidden md:block"
        style={{ pointerEvents: "none", opacity: hover ? 1 : 0, transition: "opacity .35s" }}
      >
        <span className="caption whitespace-nowrap">{label}</span>
      </Html>
    </group>
  );
}
