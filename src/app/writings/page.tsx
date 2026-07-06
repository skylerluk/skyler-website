import type { Metadata } from "next";
import Link from "next/link";
import { SectionShell } from "@/components/sections/SectionShell";
import { getEssays, getJournals } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Writings — Skyler Luk",
  description: "Essays and journals — a record of a life, kept honestly.",
};

export default function WritingsPage() {
  const essays = getEssays();
  const journals = getJournals();

  return (
    <SectionShell title="Writings">
      <p className="text-cream/70">
        Essays when a thought finally holds still, and journals kept for years.
      </p>

      <h2 className="caption mt-14 !text-[0.8rem] text-glow/90">Essays</h2>
      <ul className="mt-4 divide-y divide-cream/10">
        {essays.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/writings/essays/${e.slug}`}
              className="group block py-5"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span
                  className="text-xl text-cream transition-colors group-hover:text-glow"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {e.title}
                </span>
                <span className="shrink-0 text-xs text-cream/45">{formatDate(e.date)}</span>
              </div>
              <p className="mt-1 text-sm italic text-cream/60">{e.hook}</p>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="caption mt-14 !text-[0.8rem] text-glow/90">Journals</h2>
      <p className="mt-3 text-sm text-cream/60">
        {journals.length} entries, from {formatDate(journals[journals.length - 1].date)} to{" "}
        {formatDate(journals[0].date)} — browsable by date, theme, and place.
      </p>
      <Link
        href="/writings/journals"
        className="group mt-4 block rounded-2xl border border-cream/15 bg-[#17100a]/70 px-6 py-5 transition-colors hover:border-glow/50"
      >
        <span
          className="text-xl text-cream transition-colors group-hover:text-glow"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          Open the journal archive ›
        </span>
        <p className="mt-1 text-sm text-cream/60">
          Dated entries — intimate, unpolished, as written.
        </p>
      </Link>
    </SectionShell>
  );
}
