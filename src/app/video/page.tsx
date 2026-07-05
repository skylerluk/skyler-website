import type { Metadata } from "next";
import { SectionShell, StubNote } from "@/components/sections/SectionShell";

export const metadata: Metadata = { title: "Video — Skyler Luk" };

export default function VideoPage() {
  return (
    <SectionShell title="Video">
      <p>@skysaidso — TikTok and YouTube, propped on the phone.</p>
      <StubNote milestone="Milestone 4" />
    </SectionShell>
  );
}
