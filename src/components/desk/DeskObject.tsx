"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, MotionValue, useReducedMotion, useTransform } from "framer-motion";
import type { DeskObjectDef } from "@/lib/manifest";

/**
 * One interactive desk object: a full-canvas transparent layer image that
 * lifts/brightens on hover or focus, plus an invisible hit-area link over the
 * object and a small caption beneath it. Only rendered clickable once lit.
 */
export function DeskObject({
  def,
  lit,
  px,
  py,
}: {
  def: DeskObjectDef & { route: string };
  lit: boolean;
  px: MotionValue<number>;
  py: MotionValue<number>;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);
  const drift = reduced ? 0 : 14;
  const x = useTransform(px, (v) => v * drift * def.depth);
  const y = useTransform(py, (v) => v * drift * def.depth);
  const { hit } = def;

  return (
    <>
      <motion.img
        src={`/desk/${def.asset}`}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        style={{ x, y }}
        animate={{
          y: hover && !reduced ? -7 : 0,
          scale: hover && !reduced ? 1.015 : 1,
          filter: hover ? "brightness(1.14)" : "brightness(1)",
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      />
      {lit && (
        <a
          href={def.route}
          aria-label={`${def.label} — ${def.id.replace(/-/g, " ")}`}
          className="absolute z-30 hidden cursor-pointer rounded-lg md:block"
          style={{
            left: `${hit.x * 100}%`,
            top: `${hit.y * 100}%`,
            width: `${hit.w * 100}%`,
            height: `${hit.h * 100}%`,
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          onClick={(e) => {
            e.preventDefault();
            router.push(def.route);
          }}
        />
      )}
      {lit && (
        <motion.span
          className="caption pointer-events-none absolute z-30 hidden text-center md:block"
          style={{
            left: `${def.caption.x * 100}%`,
            top: `${def.caption.y * 100}%`,
            transform: "translateX(-50%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: hover ? 1 : 0.72 }}
          transition={{ duration: 0.3 }}
        >
          {def.label}
        </motion.span>
      )}
    </>
  );
}
