/** Warm serif long-form body. Paragraphs split on blank lines; single line
 *  breaks inside a paragraph are kept (journal entries include verse). */
export function Prose({ text }: { text: string }) {
  return (
    <div
      className="space-y-6 text-[1.05rem] leading-[1.85] text-cream/90"
      style={{ fontFamily: "var(--font-fraunces)" }}
    >
      {text
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
    </div>
  );
}
