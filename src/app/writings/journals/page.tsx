import type { Metadata } from "next";
import Link from "next/link";
import { SectionShell } from "@/components/sections/SectionShell";
import { Chip } from "@/components/ui/Chip";
import {
  getJournals,
  journalPlaces,
  journalTags,
  journalYears,
  type JournalEntry,
} from "@/lib/content";
import { formatDate, formatMonth } from "@/lib/format";

export const metadata: Metadata = {
  title: "Journals — Skyler Luk",
  description: "A calm archive of dated journal entries, by date, theme, and place.",
};

type Filters = { tag?: string; place?: string; year?: string };

/** Build a query string with one filter toggled (clicking an active chip clears it). */
function href(current: Filters, key: keyof Filters, value: string) {
  const next: Filters = { ...current, [key]: current[key] === value ? undefined : value };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v) qs.set(k, v);
  const s = qs.toString();
  return `/writings/journals${s ? `?${s}` : ""}`;
}

function EntryCard({ j }: { j: JournalEntry }) {
  return (
    <Link
      href={`/writings/journals/${j.slug}`}
      className="group block rounded-2xl border border-cream/12 bg-[#17100a]/70 px-6 py-5 transition-colors hover:border-glow/50"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span
          className="text-lg text-cream transition-colors group-hover:text-glow"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {j.title}
        </span>
        <span className="shrink-0 text-xs text-cream/45">{formatDate(j.date)}</span>
      </div>
      <p className="mt-2 text-sm italic leading-relaxed text-cream/60">“{j.excerpt}”</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip label={j.place} />
        {j.tags.map((t) => (
          <Chip key={t} label={t} />
        ))}
      </div>
    </Link>
  );
}

export default async function JournalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const f: Filters = {
    tag: typeof sp.tag === "string" ? sp.tag : undefined,
    place: typeof sp.place === "string" ? sp.place : undefined,
    year: typeof sp.year === "string" ? sp.year : undefined,
  };

  const all = getJournals();
  const filtered = all.filter(
    (j) =>
      (!f.tag || j.tags.includes(f.tag)) &&
      (!f.place || j.place === f.place) &&
      (!f.year || j.date.startsWith(f.year)),
  );

  // vertical timeline: group by month, newest first
  const months = new Map<string, JournalEntry[]>();
  for (const j of filtered) {
    const ym = j.date.slice(0, 7);
    months.set(ym, [...(months.get(ym) ?? []), j]);
  }

  const filterActive = f.tag || f.place || f.year;

  return (
    <SectionShell title="Journals">
      <p className="text-cream/70">
        Dated entries — intimate, unpolished, as written. Three ways in: by
        date, by theme, by place.
      </p>

      <div className="mt-10 space-y-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="caption mr-2 !text-[0.68rem] text-cream/45">date</span>
          {journalYears(all).map((y) => (
            <Chip key={y} label={y} href={href(f, "year", y)} active={f.year === y} />
          ))}
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="caption mr-2 !text-[0.68rem] text-cream/45">theme</span>
          {journalTags(all).map((t) => (
            <Chip key={t} label={t} href={href(f, "tag", t)} active={f.tag === t} />
          ))}
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="caption mr-2 !text-[0.68rem] text-cream/45">place</span>
          {journalPlaces(all).map((p) => (
            <Chip key={p} label={p} href={href(f, "place", p)} active={f.place === p} />
          ))}
        </div>
      </div>

      {filterActive && (
        <p className="mt-6 text-sm text-cream/55">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"} ·{" "}
          <Link href="/writings/journals" className="underline decoration-cream/30 underline-offset-4 hover:text-cream">
            clear filters
          </Link>
        </p>
      )}

      <div className="mt-10 space-y-10">
        {[...months.entries()].map(([ym, entries]) => (
          <section key={ym} aria-label={formatMonth(ym)}>
            <h2 className="caption !text-[0.72rem] text-cream/50">{formatMonth(ym)}</h2>
            <div className="mt-3 space-y-4 border-l border-cream/10 pl-5">
              {entries.map((j) => (
                <EntryCard key={j.slug} j={j} />
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <p className="italic text-cream/50">Nothing here under that light — try another filter.</p>
        )}
      </div>
    </SectionShell>
  );
}
