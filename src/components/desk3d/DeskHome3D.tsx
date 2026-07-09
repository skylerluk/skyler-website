"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DeskScene } from "@/components/desk/DeskScene";
import { MobileDeskList } from "@/components/desk/MobileDeskList";
import { Wordmark } from "@/components/ui/Wordmark";

const Desk3DScene = dynamic(
  () => import("./Desk3DScene").then((m) => m.Desk3DScene),
  { ssr: false, loading: () => null },
);

const LIT_KEY = "desk-lit";

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The desk home: real-time 3D hero behind a fast poster, degrading to the
 * baked 2.5D desk when WebGL is missing or reduced motion is preferred.
 */
export function DeskHome3D() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<"pending" | "3d" | "baked">("pending");
  const [ready, setReady] = useState(false); // first frames rendered
  const [lit, setLit] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    // sessionStorage/WebGL are client-only; decide the mode + lit state once on mount
    if (sessionStorage.getItem(LIT_KEY) === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInstant(true);
      setLit(true);
    }
    setMode(!webglAvailable() || reduced ? "baked" : "3d");
  }, [reduced]);

  const toggle = () => {
    setInstant(false);
    setLit((v) => {
      sessionStorage.setItem(LIT_KEY, v ? "" : "1");
      return !v;
    });
  };

  if (mode === "baked") return <DeskScene />;

  return (
    <div className="film-grain relative h-dvh w-full overflow-hidden bg-night">
      {/* Poster only while the 3D bundle loads AND only when the desk is meant
          to be lit (returning visitor). The dark intro must stay near-black —
          bg-night matches the 3D scene background, so no poster is needed and
          we never flash the (lit) desk before "light the candle". */}
      {!ready && lit && (
        // eslint-disable-next-line @next/next/no-img-element -- full-bleed poster; optimized jpg
        <img
          src="/og.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(0.85) saturate(0.95)" }}
        />
      )}

      {mode === "3d" && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"} ${lit ? "max-md:pointer-events-none" : ""}`}
          onPointerDown={() => setReady(true)}
          ref={() => {
            // mark ready shortly after mount; the canvas fades over the poster
            if (!ready) setTimeout(() => setReady(true), 350);
          }}
        >
          <Desk3DScene lit={lit} instant={instant} reduced={!!reduced} onCandleClick={toggle} />
        </div>
      )}

      {/* cinematic vignette — done in CSS instead of the WebGL composer, which
          banded the candlelight falloff into blocky rectangles on some GPUs */}
      {mode === "3d" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-1000"
          style={{
            opacity: ready ? 1 : 0,
            background:
              "radial-gradient(120% 90% at 28% 40%, rgba(13,8,5,0) 42%, rgba(13,8,5,0.5) 78%, rgba(13,8,5,0.82) 100%)",
          }}
        />
      )}

      {/* keyboard path: the candle stays a real, focusable switch */}
      <button
        type="button"
        aria-label={lit ? "Blow out the candle and dim the desk" : "Light the candle"}
        aria-pressed={lit}
        onClick={toggle}
        className="absolute left-[6%] top-[18%] z-30 h-[26%] w-[13%] cursor-pointer rounded-xl opacity-0 focus-visible:opacity-100 max-md:opacity-0"
      />

      <AnimatePresence>
        {!lit && (
          <motion.span
            className="caption pointer-events-none absolute left-[12%] top-[52%] z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            transition={{ duration: 1.2, delay: 0.8 }}
          >
            light the candle
          </motion.span>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!lit && (
          <motion.h1
            className="pointer-events-none absolute left-1/2 top-[10%] z-20 -translate-x-1/2 text-center font-light tracking-[0.42em] text-cream"
            style={{ fontSize: "clamp(1.3rem, 3.4vw, 2.6rem)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.92 }}
            exit={{ opacity: 0, transition: { duration: 0.9 } }}
            transition={{ duration: 1.4 }}
          >
            SKYLER&nbsp;LUK
          </motion.h1>
        )}
      </AnimatePresence>

      {lit && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: instant ? 0 : 1.2, delay: instant ? 0 : 0.8 }}>
          <Wordmark asLink={false} />
        </motion.div>
      )}

      {/* the one soft persistent hint — labels themselves only appear on hover */}
      {lit && (
        <motion.span
          className="caption pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.2, delay: instant ? 0.4 : 2.2 }}
        >
          explore the desk
        </motion.span>
      )}

      {/* keyboard path to the sections (the 3D objects are pointer-only) */}
      {lit && (
        <nav aria-label="Desk sections" className="absolute left-6 top-16 z-30 hidden md:block">
          {[
            ["Writings", "/writings"],
            ["Technical Builds", "/builds"],
            ["Work & Ventures", "/work"],
            ["About Me", "/about"],
            ["Video", "/video"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="caption block -translate-x-[200%] rounded px-2 py-1 focus-visible:translate-x-0"
            >
              {label}
            </a>
          ))}
        </nav>
      )}

      {/* small screens: warm stack once lit (3D stays as backdrop) */}
      {lit && <MobileDeskList instant={instant} />}
    </div>
  );
}
