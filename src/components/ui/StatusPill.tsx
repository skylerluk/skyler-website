import type { BuildStatus } from "@/lib/content";

const styles: Record<BuildStatus, string> = {
  Live: "border-glow/60 bg-glow/15 text-glow",
  Prototype: "border-cream/30 bg-cream/5 text-cream/75",
  Internal: "border-cream/15 bg-transparent text-cream/50",
};

export function StatusPill({ status }: { status: BuildStatus }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[0.65rem] uppercase tracking-[0.18em] ${styles[status]}`}
    >
      {status}
    </span>
  );
}
