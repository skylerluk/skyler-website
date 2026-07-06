import type { Metadata } from "next";
import { SectionShell } from "@/components/sections/SectionShell";
import { Prose } from "@/components/sections/Prose";
import { getAboutDraft } from "@/lib/content";

export const metadata: Metadata = {
  title: "About — Skyler Luk",
  description: "The yellow post-it, unfolded — who I am, first-person.",
};

export default function AboutPage() {
  const about = getAboutDraft();

  return (
    <SectionShell title="About Me">
      {about.isDraft && (
        <p className="caption -mt-2 mb-8 inline-block rounded-full border border-glow/40 bg-glow/10 px-3 py-1 !text-[0.65rem] text-glow">
          draft — still being written
        </p>
      )}
      <Prose text={about.body} />
    </SectionShell>
  );
}
