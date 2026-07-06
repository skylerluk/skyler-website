import type { Metadata } from "next";
import Link from "next/link";
import { SectionShell } from "@/components/sections/SectionShell";
import { Chip } from "@/components/ui/Chip";
import { StatusPill } from "@/components/ui/StatusPill";
import { getBuilds, type Build } from "@/lib/content";

export const metadata: Metadata = {
  title: "Technical Builds — Skyler Luk",
  description: "Things I've shipped — Sailor first. The laptop, zoomed in.",
};

const FILTERS = ["All", "Live", "Prototype"] as const;

function BuildCard({ b }: { b: Build }) {
  return (
    <Link
      href={`/builds/${b.id}`}
      className="group flex h-full flex-col rounded-2xl border border-cream/12 bg-[#17100a]/70 px-6 py-5 transition-colors hover:border-glow/50"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-lg text-cream transition-colors group-hover:text-glow"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {b.name}
        </span>
        <StatusPill status={b.status} />
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-cream/65">{b.oneLiner}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {b.stack.map((s) => (
          <Chip key={s} label={s} />
        ))}
      </div>
    </Link>
  );
}

export default async function BuildsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "All";

  const all = getBuilds();
  const hero = all.find((b) => b.featured);
  const rest = all.filter((b) => !b.featured);
  const visible = status === "All" ? rest : rest.filter((b) => b.status === status);
  const showHero = hero && (status === "All" || hero.status === status);

  return (
    <SectionShell title="Technical Builds">
      <p className="text-cream/70">
        Zoomed into the laptop: things I&apos;ve built — questions I couldn&apos;t
        stop asking, shipped.
      </p>

      {/* segmented filter — real URLs, back button works */}
      <div
        role="group"
        aria-label="Filter builds by status"
        className="mt-8 inline-flex overflow-hidden rounded-full border border-cream/15"
      >
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "All" ? "/builds" : `/builds?status=${f}`}
            aria-current={status === f ? "true" : undefined}
            className={`px-4 py-1.5 text-xs tracking-[0.14em] uppercase transition-colors ${
              status === f
                ? "bg-glow/15 text-glow"
                : "text-cream/60 hover:bg-cream/5 hover:text-cream/90"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      {/* hero: Sailor */}
      {showHero && (
        <Link
          href={`/builds/${hero.id}`}
          className="group mt-8 block rounded-3xl border border-glow/25 bg-gradient-to-br from-[#241507]/90 to-[#17100a]/90 px-8 py-7 transition-colors hover:border-glow/60"
        >
          <div className="flex items-center gap-4">
            <span
              className="text-3xl text-cream transition-colors group-hover:text-glow"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              {hero.name}
            </span>
            <StatusPill status={hero.status} />
          </div>
          <p className="mt-3 max-w-xl leading-relaxed text-cream/75">{hero.oneLiner}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {hero.stack.map((s) => (
              <Chip key={s} label={s} />
            ))}
          </div>
          <p className="caption mt-6 !text-[0.7rem] text-glow/80">
            read the story ›
          </p>
        </Link>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {visible.map((b) => (
          <BuildCard key={b.id} b={b} />
        ))}
      </div>
      {!showHero && visible.length === 0 && (
        <p className="mt-8 italic text-cream/50">Nothing on the screen under that filter.</p>
      )}
    </SectionShell>
  );
}
