export function formatDateShort(d: string | null): string | null {
  if (!d) return null;
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateLong(d: string | null): string | null {
  if (!d) return null;
  return new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}
