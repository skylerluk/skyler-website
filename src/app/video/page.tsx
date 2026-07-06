import type { Metadata } from "next";
import Script from "next/script";
import { SectionShell } from "@/components/sections/SectionShell";

export const metadata: Metadata = {
  title: "Video — Skyler Luk",
  description: "@skysaidso — TikTok and YouTube.",
};

const TIKTOK = "https://www.tiktok.com/@skysaidso";
const YOUTUBE = "https://www.youtube.com/@skysaidso";

export default function VideoPage() {
  return (
    <SectionShell title="Video">
      <p className="text-cream/70">
        The propped phone: <strong>@skysaidso</strong> — where I talk to a
        camera and mean it.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={TIKTOK}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-glow/40 bg-glow/10 px-5 py-2 text-sm text-glow transition-colors hover:bg-glow/20"
        >
          TikTok ↗
        </a>
        <a
          href={YOUTUBE}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-cream/25 px-5 py-2 text-sm text-cream/80 transition-colors hover:border-cream/50 hover:text-cream"
        >
          YouTube ↗
        </a>
      </div>

      {/* TikTok creator embed — official embed.js, profile-level (no video IDs needed) */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-cream/12 bg-[#17100a]/70 p-2">
        <blockquote
          className="tiktok-embed"
          cite={TIKTOK}
          data-unique-id="skysaidso"
          data-embed-type="creator"
          style={{ maxWidth: "720px", minWidth: "288px", margin: 0 }}
        >
          <section>
            <a target="_blank" rel="noopener noreferrer" href={TIKTOK}>
              @skysaidso on TikTok
            </a>
          </section>
        </blockquote>
      </div>
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
    </SectionShell>
  );
}
