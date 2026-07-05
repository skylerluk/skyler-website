import type { Metadata } from "next";
import { SectionShell, StubNote } from "@/components/sections/SectionShell";

export const metadata: Metadata = { title: "Technical Builds — Skyler Luk" };

export default function BuildsPage() {
  return (
    <SectionShell title="Technical Builds">
      <p>
        Zoomed into the laptop: things I&apos;ve shipped — Sailor first, then
        Stax, Uber Wrapped, a teacher co-pilot, and the tooling behind them.
      </p>
      <StubNote milestone="Milestone 3" />
    </SectionShell>
  );
}
