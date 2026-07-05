"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The live flame sprite + its bloom, anchored at the manifest's flame point.
 * The flame is never baked into the art — it is the one living element.
 */
export function Flame({ x, y, lit }: { x: number; y: number; lit: boolean }) {
  const reduced = useReducedMotion();
  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      aria-hidden
    >
      {/* ember wick, faintly visible pre-light */}
      {!lit && <span className="ember" />}
      {lit && (
        <>
          <motion.span
            className="flame"
            initial={reduced ? { opacity: 0 } : { scaleY: 0.1, opacity: 0 }}
            animate={
              reduced
                ? { opacity: 1 }
                : { scaleY: [0.1, 1.25, 0.95, 1], opacity: 1 }
            }
            transition={{ duration: reduced ? 0.4 : 1.1, ease: "easeOut" }}
          />
          {/* local halo right around the flame */}
          <motion.span
            className="glow-pulse pointer-events-none absolute -left-20 -top-24 h-40 w-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,203,120,0.5) 0%, rgba(255,158,75,0.18) 45%, rgba(255,158,75,0) 70%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0.4 : 1.4, ease: "easeOut" }}
          />
        </>
      )}
    </div>
  );
}
