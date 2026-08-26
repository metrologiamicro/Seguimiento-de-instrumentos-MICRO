export function parseDate(str: string): Date | null {
  if (!str) return null;
  const cleanStr = str.trim();

  // Match YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = cleanStr.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (isoMatch) {
    const [, y, mo, d] = isoMatch;
    const parsed = new Date(+y, +mo - 1, +d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // Match DD/MM/YYYY or DD-MM-YYYY
  const latMatch = cleanStr.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if (latMatch) {
    let [, d, mo, y] = latMatch;
    if (y.length === 2) y = "20" + y;
    const parsed = new Date(+y, +mo - 1, +d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // Fallback to standard Date parse
  const fallback = new Date(cleanStr);
  return isNaN(fallback.getTime()) ? null : fallback;
}

export function formatDate(str: string): string {
  const d = parseDate(str);
  if (!d) return str || "—";
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function diffDays(dateStr: string): number | null {
  const d = parseDate(dateStr);
  if (!d) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - hoy.getTime()) / 86400000);
}
