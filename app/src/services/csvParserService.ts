export function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  return lines.map(line => {
    const cols: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQ = !inQ;
        continue;
      }
      if (c === "," && !inQ) {
        cols.push(cur.trim());
        cur = "";
        continue;
      }
      cur += c;
    }
    cols.push(cur.trim());
    return cols;
  });
}

export function findHeaderRow(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    if (rows[i].some(c => /^CODIGO$/i.test(c.trim()))) return i;
  }
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const row = rows[i].map(c => c.trim().toUpperCase());
    const hits = ["CODIGO", "INSTRUMENTO", "CALIBRADO", "VENCIMIENTO"].filter(k => row.includes(k));
    if (hits.length >= 2) return i;
  }
  return 2;
}
