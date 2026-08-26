import type { Instrument, InstrumentStatus } from "../types/instrument";
import { diffDays } from "../utils/dateUtils";
import { parseCSV, findHeaderRow } from "./csvParserService";

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQO2xlTCHWbylhgjp9Tlv-0HM6z0ZlXzh3i-VYxNgiNUwwC2g1ZZ4nLHguumRm2uTU1Ql1KV23efn7g/pub?gid=1657588836&single=true&output=csv";

export class InstrumentService {
  public static async fetchInstruments(): Promise<Instrument[]> {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const text = await response.text();
    const rows = parseCSV(text);
    const hi = findHeaderRow(rows);
    const H = rows[hi].map(h => h.toUpperCase().trim());

    const idx = (name: string): number => {
      let i = H.findIndex(h => h === name);
      if (i === -1) i = H.findIndex(h => h.includes(name));
      return i;
    };

    const iCod = idx("CODIGO");
    const iNom = idx("INSTRUMENTO");
    const iSec = idx("SECTOR");
    const iCal = idx("CALIBRADO");
    const iVto = idx("VENCIMIENTO");
    const iAvis = idx("AVISO");

    const list: Instrument[] = rows
      .slice(hi + 1, hi + 2001)
      .filter(r => r[iNom] && r[iNom].trim())
      .map(r => ({
        codigo: (r[iCod] || "").trim(),
        nombre: (r[iNom] || "").trim(),
        sector: (r[iSec] || "").trim(),
        calibrado: (r[iCal] || "").trim(),
        vto: (r[iVto] || "").trim(),
        aviso: (r[iAvis] || "").trim(),
      }));

    return list;
  }

  public static calculateStatus(vto: string, aviso: string): InstrumentStatus {
    const dias = diffDays(vto);
    const diasAviso = diffDays(aviso);

    if (dias === null) {
      return { key: "none", label: "Sin datos", diasRemaining: null };
    }
    if (dias < 0) {
      return { key: "danger", label: "VENCIDO", diasRemaining: dias };
    }
    if (diasAviso !== null && diasAviso <= 0) {
      return { key: "warn", label: "Por vencer", diasRemaining: dias };
    }
    return { key: "ok", label: "APTO", diasRemaining: dias };
  }

  public static filterInstruments(instruments: Instrument[], query: string): Instrument[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return instruments.filter(
      i =>
        i.codigo.toLowerCase().includes(q) ||
        i.nombre.toLowerCase().includes(q) ||
        i.sector.toLowerCase().includes(q)
    );
  }
}
