"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { candle, clickableObjects, deskManifest } from "@/lib/manifest";
import { DeskObject } from "./DeskObject";
import { Flame } from "./Flame";
import { MobileDeskList } from "./MobileDeskList";
import { Wordmark } from "@/components/ui/Wordmark";

const LIT_KEY = "desk-lit";

export function DeskScene() {
  const reduced = useReducedMotion();
  const [lit, setLit] = useState(false);
  // skip the reveal animation when returning to an already-lit desk
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    // sessionStorage is client-only; hydrate the returning-visitor lit state once on mount
    if (sessionStorage.getItem(LIT_KEY) === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInstant(true);
      setLit(true);
    }
  }, []);

  const toggle = () => {
    setInstant(false);
    setLit((v) => {
      sessionStorage.setItem(LIT_KEY, v ? "" : "1");
      return !v;
    });
  };

  // pointer parallax, normalized to [-1, 1] around viewport center
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 60, damping: 20 });
  const py = useSpring(rawY, { stiffness: 60, damping: 20 });
  const baseX = useTransform(px, (v) => v * (reduced ? 0 : 6));
  const baseY = useTransform(py, (v) => v * (reduced ? 0 : 6));

  const onPointerMove = (e: React.PointerEvent) => {
    rawX.set((e.clientX / window.innerWidth) * 2 - 1);
    rawY.set((e.clientY / window.innerHeight) * 2 - 1);
  };

  const { flame } = deskManifest;
  const revealDur = reduced ? 0.5 : 1.5;
  const dur = instant ? 0 : revealDur;

  return (
    <div
      className="film-grain relative h-dvh w-full overflow-hidden bg-night"
      onPointerMove={onPointerMove}
    >
      {/* desk canvas: 16:10, covers the viewport; anchored left on mobile so the candle stays in frame */}
      <div
        className={`absolute top-1/2 h-full -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 ${
          lit ? "max-md:hidden" : ""
        }`}
        style={{
          width: "max(100vw, 160dvh)",
          aspectRatio: "1.6",
          left: 0,
        }}
      >
        {/* baked, lit base render */}
        <motion.img
          src="/desk/base.webp"
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 h-full w-full select-none"
          style={{
            x: baseX,
            y: baseY,
            backgroundImage: "url(/desk/poster.webp)",
            backgroundSize: "cover",
          }}
        />

        {/* interactive object layers */}
        {clickableObjects.map((o) => (
          <DeskObject key={o.id} def={o} lit={lit} px={px} py={py} />
        ))}

        {/* candle layer (the switch) */}
        <motion.img
          src="/desk/obj-candle.png"
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          style={{ x: useTransform(px, (v) => v * (reduced ? 0 : 7)), y: useTransform(py, (v) => v * (reduced ? 0 : 7)) }}
        />

        {/* warm light bloom, between layers — fades in as the candle lights */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: `radial-gradient(circle at ${flame.x * 100}% ${flame.y * 100}%, rgba(255,203,120,0.30) 0%, rgba(255,158,75,0.12) 30%, rgba(255,158,75,0) 62%)`,
            mixBlendMode: "screen",
          }}
          initial={false}
          animate={{ opacity: lit ? 1 : 0 }}
          transition={{ duration: dur, ease: "easeOut" }}
        />

        {/* darkness overlay: near-dark intro → lifts to a soft warm vignette (never fully black once lit) */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: `radial-gradient(circle at ${flame.x * 100}% ${flame.y * 100}%, rgba(13,8,5,0.62) 0%, rgba(13,8,5,0.94) 26%, rgba(13,8,5,0.985) 65%)`,
          }}
          initial={false}
          animate={{ opacity: lit ? 0 : 1 }}
          transition={{ duration: dur, ease: "easeOut" }}
        />
        {/* permanent warm vignette so edges fall away gently */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: `radial-gradient(ellipse at ${flame.x * 100 + 18}% ${flame.y * 100 + 22}%, rgba(20,10,4,0) 38%, rgba(16,9,4,0.5) 100%)`,
          }}
        />

        <Flame x={flame.x} y={flame.y} lit={lit} />

        {/* candle hit area — the switch; there is no button */}
        <button
          type="button"
          aria-label={lit ? "Blow out the candle and dim the desk" : "Light the candle"}
          aria-pressed={lit}
          onClick={toggle}
          className="absolute z-30 cursor-pointer rounded-xl"
          style={{
            left: `${candle.hit.x * 100}%`,
            top: `${candle.hit.y * 100}%`,
            width: `${candle.hit.w * 100}%`,
            height: `${candle.hit.h * 100}%`,
          }}
        />

        {/* intro prompt near the candle */}
        <AnimatePresence>
          {!lit && (
            <motion.span
              className="caption pointer-events-none absolute z-20"
              style={{
                left: `${(candle.hit.x + candle.hit.w / 2) * 100}%`,
                top: `${(candle.hit.y + candle.hit.h) * 100 + 2}%`,
                transform: "translateX(-50%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              transition={{ duration: 1.2, delay: 0.8 }}
            >
              light the candle
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* intro name — recedes to the wordmark once lit; never overlaps the laptop (sits above it) */}
      <AnimatePresence>
        {!lit && (
          <motion.h1
            className="pointer-events-none absolute left-1/2 top-[12%] z-20 -translate-x-1/2 text-center font-light tracking-[0.42em] text-cream"
            style={{ fontSize: "clamp(1.3rem, 3.4vw, 2.6rem)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.92 }}
            exit={{ opacity: 0, transition: { duration: revealDur * 0.6 } }}
            transition={{ duration: 1.4 }}
          >
            SKYLER&nbsp;LUK
          </motion.h1>
        )}
      </AnimatePresence>

      {lit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur, delay: instant ? 0 : dur * 0.5 }}
        >
          <Wordmark asLink={false} />
        </motion.div>
      )}

      {/* mobile: warm vertical stack instead of a cramped desk */}
      {lit && <MobileDeskList instant={instant} />}
    </div>
  );
}
