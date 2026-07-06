/**
 * Warm serif long-form body. Content is authored as light markdown:
 *  - blank lines separate blocks
 *  - `## Heading` → section heading
 *  - lines starting `- ` → bullet list
 *  - lines starting `1. ` → numbered list
 *  - everything else → paragraph (single line breaks preserved for verse)
 */
export function Prose({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <div
      className="space-y-6 text-[1.05rem] leading-[1.85] text-cream/90"
      style={{ fontFamily: "var(--font-fraunces)" }}
    >
      {blocks.map((block, i) => {
        const lines = block.split("\n");

        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="pt-4 text-2xl font-medium text-cream">
              {block.replace(/^##\s+/, "")}
            </h2>
          );
        }

        if (lines.every((l) => /^-\s+/.test(l))) {
          return (
            <ul key={i} className="ml-1 list-disc space-y-2 pl-5 marker:text-glow/70">
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^-\s+/, "")}</li>
              ))}
            </ul>
          );
        }

        if (lines.every((l) => /^\d+\.\s+/.test(l))) {
          return (
            <ol key={i} className="ml-1 list-decimal space-y-2 pl-5 marker:text-glow/70">
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^\d+\.\s+/, "")}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={i} className="whitespace-pre-line">
            {block}
          </p>
        );
      })}
    </div>
  );
}
