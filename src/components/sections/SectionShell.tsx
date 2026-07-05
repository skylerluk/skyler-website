import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark";

/**
 * Clean, warm 2D interior shell. The desk is the world; these rooms are for
 * reading. M1 renders stubs inside it; later milestones fill them in.
 */
export function SectionShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Wordmark />
      <main
        aria-label={title}
        className="fade-in mx-auto min-h-dvh max-w-2xl px-6 pb-24 pt-28"
      >
        <Link
          href="/"
          className="caption opacity-70 transition-opacity hover:opacity-100"
        >
          ‹ desk
        </Link>
        <h1
          className="mt-6 text-4xl font-light text-cream"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {title}
        </h1>
        <div className="mt-8 leading-relaxed text-cream/80">{children}</div>
      </main>
    </>
  );
}

export function StubNote({ milestone }: { milestone: string }) {
  return (
    <p className="mt-10 border-t border-cream/10 pt-6 text-sm italic text-cream/45">
      This room is still being furnished — it arrives with {milestone}.
    </p>
  );
}
