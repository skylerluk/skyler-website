import Link from "next/link";

export function Chip({
  label,
  href,
  active = false,
}: {
  label: string;
  href?: string;
  active?: boolean;
}) {
  const cls = `inline-block rounded-full border px-3 py-1 text-xs tracking-wide transition-colors ${
    active
      ? "border-glow/70 bg-glow/15 text-glow"
      : "border-cream/20 text-cream/65 hover:border-cream/45 hover:text-cream/90"
  }`;
  if (!href) return <span className={cls}>{label}</span>;
  return (
    <Link href={href} className={cls} scroll={false}>
      {label}
    </Link>
  );
}
