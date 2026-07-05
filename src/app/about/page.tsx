import type { Metadata } from "next";
import { SectionShell, StubNote } from "@/components/sections/SectionShell";

export const metadata: Metadata = { title: "About — Skyler Luk" };

export default function AboutPage() {
  return (
    <SectionShell title="About Me">
      <p>The yellow post-it, unfolded. A first-person note — being written.</p>
      <StubNote milestone="Milestone 4" />
    </SectionShell>
  );
}
