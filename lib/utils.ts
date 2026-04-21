/** Junta classes CSS (sem Tailwind). Útil se você reintroduzir web no monorepo. */
export function cn(...parts: Array<string | undefined | false | null>): string {
  return parts.filter(Boolean).join(" ");
}
