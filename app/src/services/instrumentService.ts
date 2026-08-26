import type { Instrument, InstrumentStatus } from "../types/instrument";
import { diffDays } from "../utils/dateUtils";
import { supabase } from "./supabaseClient";

interface SupabaseInstrumentRow {
  codigo: string | null;
  nombre: string | null;
  sector: string | null;
  estado_calibracion?: string | null;
  fecha_ultima_calibracion?: string | null;
  fecha_vencimiento_calibracion?: string | null;
  [key: string]: unknown;
}

export class InstrumentService {
  public static async fetchInstruments(): Promise<Instrument[]> {
    const { data, error } = await supabase
      .from("instrumentos")
      .select("*");

    if (error) {
      console.error("Error fetching from Supabase:", error);
      throw new Error(`Supabase Error: ${error.message}`);
    }

    if (!data) return [];

    const list: Instrument[] = (data as SupabaseInstrumentRow[])
      .filter(r => r.nombre && r.nombre.trim())
      .map(r => ({
        codigo: (r.codigo || "").trim(),
        nombre: (r.nombre || "").trim(),
        sector: (r.sector || "").trim(),
        calibrado: (r.fecha_ultima_calibracion || "").trim(),
        vto: (r.fecha_vencimiento_calibracion || "").trim(),
        aviso: (r.fecha_vencimiento_calibracion || "").trim(), // Usa fecha vencimiento para alerta si no existe aviso explícito
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
    // Si quedan <= 30 días o si fecha aviso es <= hoy, marcar por vencer
    if ((diasAviso !== null && diasAviso <= 0) || dias <= 30) {
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
