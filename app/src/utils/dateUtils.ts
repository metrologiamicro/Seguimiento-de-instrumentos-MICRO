export function parseDate(str: string): Date | null {
  if (!str) return null;
  const m = str.trim().match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (!m) return null;
  let [, d, mo, y] = m;
  if (y.length === 2) y = "20" + y;
  const parsed = new Date(+y, +mo - 1, +d);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
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
