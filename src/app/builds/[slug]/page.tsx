import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionShell } from "@/components/sections/SectionShell";
import { Chip } from "@/components/ui/Chip";
import { StatusPill } from "@/components/ui/StatusPill";
import { getBuild, getBuilds } from "@/lib/content";

export function generateStaticParams() {
  return getBuilds().map(({ id }) => ({ slug: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const b = getBuild((await params).slug);
  if (!b) return { title: "Build — Skyler Luk" };
  return { title: `${b.name} — Skyler Luk`, description: b.oneLiner };
}

export default async function BuildPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const b = getBuild((await params).slug);
  if (!b) notFound();

  return (
    <SectionShell title={b.name}>
      <div className="-mt-2 flex items-center gap-3">
        <StatusPill status={b.status} />
      </div>
      <p
        className="mt-8 text-xl leading-relaxed text-cream/90"
        style={{ fontFamily: "var(--font-fraunces)" }}
      >
        {b.oneLiner}
      </p>
      {b.detail && (
        <p className="mt-5 leading-relaxed text-cream/70">{b.detail}</p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {b.stack.map((s) => (
          <Chip key={s} label={s} />
        ))}
      </div>

      {b.links.length > 0 && (
        <div className="mt-10 border-t border-cream/10 pt-6">
          {b.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="caption !text-[0.78rem] text-glow hover:underline"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      )}

      <nav aria-label="All builds" className="mt-10 text-sm">
        <Link href="/builds" className="text-cream/60 hover:text-glow">
          ‹ all builds
        </Link>
      </nav>
    </SectionShell>
  );
}
