import type { Metadata } from "next";
import { SectionShell, StubNote } from "@/components/sections/SectionShell";

export const metadata: Metadata = { title: "Journal — Skyler Luk" };

export default function JournalEntryPage() {
  return (
    <SectionShell title="Journal entry">
      <p>The reader for this entry is on its way.</p>
      <StubNote milestone="Milestone 2" />
    </SectionShell>
  );
}
