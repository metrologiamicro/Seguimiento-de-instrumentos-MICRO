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
  operario_marca?: string | null;
  identificacion?: string | null;
  tipo_instrumento?: string | null;
  [key: string]: unknown;
}

interface SupabaseMovimientoRow {
  codigo_instrumento: string | null;
  estado?: string | null;
  fecha_devolucion?: string | null;
  descripcion_maquina?: string | null;
  legajo_operario?: number | string | null;
  fecha_retiro?: string | null;
  hora_retiro?: string | null;
}

export class InstrumentService {
  public static async fetchInstruments(): Promise<Instrument[]> {
    // Consultar instrumentos y movimientos activos en paralelo
    const [instRes, movRes] = await Promise.all([
      supabase.from("instrumentos").select("*"),
      supabase
        .from("movimientos")
        .select("*")
        .or("estado.ilike.%EN USO%,fecha_devolucion.is.null")
    ]);

    if (instRes.error) {
      console.error("Error fetching instrumentos from Supabase:", instRes.error);
      throw new Error(`Supabase Error: ${instRes.error.message}`);
    }

    // Mapa de información de custodia para calibres activos en uso
    const custodiaMap = new Map<string, { maquina: string; retiradoPor: string; fechaRetiro: string }>();

    if (movRes.data) {
      (movRes.data as SupabaseMovimientoRow[]).forEach(m => {
        if (m.codigo_instrumento) {
          const isDevuelto = m.estado?.trim().toUpperCase() === "DEVUELTO" && m.fecha_devolucion;
          if (!isDevuelto) {
            const cleanCod = m.codigo_instrumento.trim().toUpperCase();
            const fRetiro = m.fecha_retiro ? `${m.fecha_retiro} ${m.hora_retiro || ""}`.trim() : "";
            const operarioInfo = m.legajo_operario ? `Leg. ${m.legajo_operario}` : "";
            
            custodiaMap.set(cleanCod, {
              maquina: (m.descripcion_maquina || "").trim(),
              retiradoPor: operarioInfo,
              fechaRetiro: fRetiro,
            });
          }
        }
      });
    }

    const data = instRes.data || [];

    const list: Instrument[] = (data as SupabaseInstrumentRow[])
      .filter(r => r.nombre && r.nombre.trim())
      .map(r => {
        const codigo = (r.codigo || "").trim();
        const normCod = codigo.toUpperCase();
        const movInfo = custodiaMap.get(normCod);
        const enUso = Boolean(movInfo);

        return {
          codigo,
          nombre: (r.nombre || "").trim(),
          sector: (r.sector || "").trim(),
          calibrado: (r.fecha_ultima_calibracion || "").trim(),
          vto: (r.fecha_vencimiento_calibracion || "").trim(),
          aviso: (r.fecha_vencimiento_calibracion || "").trim(),
          operarioMarca: (r.operario_marca || "").trim(),
          identificacion: (r.identificacion || "").trim(),
          tipoInstrumento: (r.tipo_instrumento || "").trim(),
          disponibilidad: enUso ? "EN USO" : "DISPONIBLE",
          maquina: movInfo ? movInfo.maquina : "",
          retiradoPor: movInfo ? movInfo.retiradoPor : "",
          fechaRetiro: movInfo ? movInfo.fechaRetiro : "",
        };
      });

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
        i.sector.toLowerCase().includes(q) ||
        (i.operarioMarca && i.operarioMarca.toLowerCase().includes(q)) ||
        (i.disponibilidad && i.disponibilidad.toLowerCase().includes(q)) ||
        (i.identificacion && i.identificacion.toLowerCase().includes(q)) ||
        (i.tipoInstrumento && i.tipoInstrumento.toLowerCase().includes(q)) ||
        (i.maquina && i.maquina.toLowerCase().includes(q))
    );
  }
}
