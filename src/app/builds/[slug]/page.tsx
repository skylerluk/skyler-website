import type { Metadata } from "next";
import { SectionShell, StubNote } from "@/components/sections/SectionShell";

export const metadata: Metadata = { title: "Build — Skyler Luk" };

export default function BuildPage() {
  return (
    <SectionShell title="Build">
      <p>This project&apos;s story is on its way.</p>
      <StubNote milestone="Milestone 3" />
    </SectionShell>
  );
}
