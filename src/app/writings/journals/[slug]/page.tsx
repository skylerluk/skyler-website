import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionShell } from "@/components/sections/SectionShell";
import { Prose } from "@/components/sections/Prose";
import { Chip } from "@/components/ui/Chip";
import { getJournal, getJournals } from "@/lib/content";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return getJournals().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const j = getJournal((await params).slug);
  if (!j) return { title: "Journal — Skyler Luk" };
  return {
    title: `${j.title} — Skyler Luk`,
    description: j.excerpt,
  };
}

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = getJournals(); // newest first
  const idx = all.findIndex((j) => j.slug === slug);
  if (idx === -1) notFound();
  const j = all[idx];
  const newer = idx > 0 ? all[idx - 1] : undefined;
  const older = idx < all.length - 1 ? all[idx + 1] : undefined;

  return (
    <SectionShell title={j.title}>
      <p className="-mt-4 text-sm text-cream/50">
        {formatDate(j.date)} · {j.place}
      </p>
      <div className="mt-10">
        <Prose text={j.body} />
      </div>
      <div className="mt-12 flex flex-wrap gap-2 border-t border-cream/10 pt-6">
        <Chip label={j.place} href={`/writings/journals?place=${encodeURIComponent(j.place)}`} />
        {j.tags.map((t) => (
          <Chip key={t} label={t} href={`/writings/journals?tag=${encodeURIComponent(t)}`} />
        ))}
      </div>
      <nav aria-label="Nearby entries" className="mt-10 flex justify-between gap-4 text-sm">
        {older ? (
          <Link href={`/writings/journals/${older.slug}`} className="text-cream/60 hover:text-glow">
            ‹ {older.title}
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link href={`/writings/journals/${newer.slug}`} className="text-right text-cream/60 hover:text-glow">
            {newer.title} ›
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </SectionShell>
  );
}
