import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionShell } from "@/components/sections/SectionShell";
import { Prose } from "@/components/sections/Prose";
import { getEssay, getEssays } from "@/lib/content";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return getEssays().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const e = getEssay((await params).slug);
  if (!e) return { title: "Essay — Skyler Luk" };
  return { title: `${e.title} — Skyler Luk`, description: e.hook };
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = getEssays();
  const idx = all.findIndex((e) => e.slug === slug);
  if (idx === -1) notFound();
  const e = all[idx];
  const next = all[(idx + 1) % all.length];

  return (
    <SectionShell title={e.title}>
      <p className="-mt-4 text-sm italic text-cream/55">{e.hook}</p>
      <p className="mt-2 text-sm text-cream/45">{formatDate(e.date)}</p>
      <div className="mt-10">
        <Prose text={e.body} />
      </div>
      {next.slug !== e.slug && (
        <nav aria-label="More essays" className="mt-12 border-t border-cream/10 pt-6 text-sm">
          <Link href={`/writings/essays/${next.slug}`} className="text-cream/60 hover:text-glow">
            next essay: {next.title} ›
          </Link>
        </nav>
      )}
    </SectionShell>
  );
}
