import Link from "next/link";

export function Wordmark({ asLink = true }: { asLink?: boolean }) {
  const text = (
    <span className="caption !text-[0.8rem] select-none">Skyler Luk</span>
  );
  if (!asLink) return <div className="fixed left-6 top-6 z-40">{text}</div>;
  return (
    <Link
      href="/"
      aria-label="Back to the desk"
      className="fixed left-6 top-6 z-40 opacity-80 transition-opacity hover:opacity-100"
    >
      {text}
    </Link>
  );
}
