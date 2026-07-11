"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { clickableObjects } from "@/lib/manifest";

const blurbs: Record<string, string> = {
  notebook: "Essays and journals — the notebook.",
  laptop: "Things I've shipped — the MacBook.",
  folder: "Ventures and roles — the manila folder.",
  "postit-about": "Who I am — the loose papers.",
};

// the phone/Video object was removed from the desk; keep it out of the mobile stack too
const HIDDEN = new Set(["phone"]);

/** Warm vertical stack for small screens — same objects, comfortably tappable. */
export function MobileDeskList({ instant }: { instant: boolean }) {
  return (
    <motion.nav
      aria-label="Desk objects"
      className="absolute inset-0 z-20 overflow-y-auto px-6 pb-12 pt-24 md:hidden"
      initial={{ opacity: instant ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, delay: instant ? 0 : 0.9 }}
      style={{
        background:
          "radial-gradient(circle at 20% 0%, rgba(255,158,75,0.14) 0%, rgba(13,8,5,0) 55%), linear-gradient(#17100a, #0d0805)",
      }}
    >
      <ul className="mx-auto flex max-w-sm flex-col gap-4">
        {clickableObjects.filter((o) => !HIDDEN.has(o.id)).map((o, i) => (
          <motion.li
            key={o.id}
            initial={instant ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: instant ? 0 : 1 + i * 0.12, duration: 0.5 }}
          >
            <Link
              href={o.route}
              className="block rounded-2xl border border-[#3b2f2a]/70 bg-[#1a110a]/90 px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-colors hover:border-glow/50"
            >
              <span className="caption !text-[0.78rem] text-glow">{o.label}</span>
              <p className="mt-1 text-sm text-cream/75">{blurbs[o.id]}</p>
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  );
}
