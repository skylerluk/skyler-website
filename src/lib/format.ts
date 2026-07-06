const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-06-24" → "June 24, 2026"; bare years pass through. */
export function formatDate(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

/** "2026-06" → "June 2026" */
export function formatMonth(ym: string) {
  const [y, mo] = ym.split("-");
  return `${MONTHS[Number(mo) - 1]} ${y}`;
}
