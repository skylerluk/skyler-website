import type { Metadata } from "next";
import { SectionShell, StubNote } from "@/components/sections/SectionShell";

export const metadata: Metadata = { title: "Work & Ventures — Skyler Luk" };

export default function WorkPage() {
  return (
    <SectionShell title="Work & Ventures">
      <p>
        Inside the manila folder: ventures and roles — consulting, founding,
        and the leadership work around them.
      </p>
      <StubNote milestone="Milestone 4" />
    </SectionShell>
  );
}
