import type { Metadata } from "next";
import { SectionShell, StubNote } from "@/components/sections/SectionShell";

export const metadata: Metadata = { title: "Journals — Skyler Luk" };

export default function JournalsPage() {
  return (
    <SectionShell title="Journals">
      <p>
        A calm archive of dated entries — browsable by date, by theme, and by
        place.
      </p>
      <StubNote milestone="Milestone 2" />
    </SectionShell>
  );
}
