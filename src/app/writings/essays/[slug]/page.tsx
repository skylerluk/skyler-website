import type { Metadata } from "next";
import { SectionShell, StubNote } from "@/components/sections/SectionShell";

export const metadata: Metadata = { title: "Essay — Skyler Luk" };

export default function EssayPage() {
  return (
    <SectionShell title="Essay">
      <p>The reader for this essay is on its way.</p>
      <StubNote milestone="Milestone 2" />
    </SectionShell>
  );
}
