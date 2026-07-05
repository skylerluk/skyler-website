import type { Metadata } from "next";
import { SectionShell, StubNote } from "@/components/sections/SectionShell";

export const metadata: Metadata = { title: "Writings — Skyler Luk" };

export default function WritingsPage() {
  return (
    <SectionShell title="Writings">
      <p>
        Essays when a thought finally holds still, and journals kept for years.
        Two branches will live here: <strong>Essays</strong> and{" "}
        <strong>Journals</strong> — the journals filterable by date, theme, and
        place.
      </p>
      <StubNote milestone="Milestone 2" />
    </SectionShell>
  );
}
