import type { Metadata } from "next";
import { SectionShell } from "@/components/sections/SectionShell";
import { getVentures } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work & Ventures — Skyler Luk",
  description: "Ventures and roles — consulting, founding, and the leadership work around them.",
};

export default function WorkPage() {
  const ventures = getVentures();

  return (
    <SectionShell title="Work & Ventures">
      <p className="text-cream/70">
        Inside the manila folder: what I&apos;ve worked on and where I&apos;ve
        led — consulting taught me how deals and teams actually work; building
        taught me what I want to make.
      </p>

      <ol className="mt-12 space-y-0 border-l border-cream/12">
        {ventures.map((v) => (
          <li key={v.id} className="relative pb-10 pl-8 last:pb-0">
            <span
              aria-hidden
              className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full border border-glow/70 bg-[#17100a]"
            />
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              {v.link ? (
                <a
                  href={v.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl text-cream transition-colors hover:text-glow"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {v.name} ↗
                </a>
              ) : (
                <span
                  className="text-xl text-cream"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {v.name}
                </span>
              )}
              <span className="text-xs tracking-wide text-cream/45">{v.years}</span>
            </div>
            <p className="caption mt-1 !text-[0.7rem] text-glow/80">{v.role}</p>
            <p className="mt-2 text-sm leading-relaxed text-cream/65">{v.description}</p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
