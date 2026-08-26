import { supabase } from "./supabaseClient";
import type { SyncProgressCallback, SyncResult } from "../types/sync";
import { parseDate, diffDays } from "../utils/dateUtils";

function normalizarFechaISO(raw: any): string | null {
  if (!raw) return null;
  const d = parseDate(String(raw));
  if (!d || isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function sincronizarGoogleSheetsConSupabase(
  onProgress?: SyncProgressCallback
): Promise<SyncResult> {
  const scriptUrl = import.meta.env.VITE_SCRIPT_URL || "";
  const rawChunkSize = import.meta.env.VITE_SYNC_CHUNK_SIZE;
  const chunkSize = Number(rawChunkSize) > 0 ? Number(rawChunkSize) : 500;

  if (!scriptUrl) {
    throw new Error("No se encuentra definida la variable VITE_SCRIPT_URL.");
  }

  if (!supabase) {
    throw new Error("Cliente de Supabase no disponible.");
  }

  // 1. Obtener catálogo maestro desde Google Apps Script
  const res = await fetch(scriptUrl, {
    method: "POST",
    body: JSON.stringify({ accion: "getInstrumentos" }),
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Error HTTP ${res.status} al consultar Google Apps Script.`);
  }

  const resJson = await res.json();
  if (!resJson || !resJson.ok || !Array.isArray(resJson.data)) {
    throw new Error(resJson?.error || "Respuesta inválida desde Google Sheets (res.data no es un array).");
  }

  const instrumentosGS: any[] = resJson.data;

  // 2. Normalizar datos para Supabase
  const rowsToUpsert = instrumentosGS
    .filter((item: any) => {
      const cod = String(item.codigo || item.c || "").trim();
      const nom = String(item.nombre || item.n || "").trim();
      return Boolean(cod && nom);
    })
    .map((item: any) => {
      const cod = String(item.codigo || item.c || "").trim();
      const nom = String(item.nombre || item.n || "").trim();
      const sec = String(item.sector || item.s || "").trim();

      const fechaCalibRaw = item.calibrado || item.fecha_ultima_calibracion || null;
      const fechaVencRaw = item.vencimiento || item.fecha_vencimiento_calibracion || null;

      const fechaCalib = normalizarFechaISO(fechaCalibRaw);
      const fechaVenc = normalizarFechaISO(fechaVencRaw);
      const diasRestantes = fechaVenc ? diffDays(fechaVenc) : null;

      let estadoCalib = String(item.estado || item.e || "CALIBRADO").toUpperCase().trim();
      if (diasRestantes !== null) {
        if (diasRestantes < 0) {
          estadoCalib = "VENCIDO";
        } else if (diasRestantes <= 30) {
          estadoCalib = "PROXIMO A CALIBRAR";
        }
      }

      return {
        codigo: cod,
        nombre: nom,
        operario_marca: String(item.operario_marca || item.marca || "").trim(),
        identificacion: String(item.identificacion || "").trim(),
        sector: sec,
        fecha_ultima_calibracion: fechaCalib,
        fecha_vencimiento_calibracion: fechaVenc,
        estado_calibracion: estadoCalib,
        destinatario_calibracion: String(item.destinatario_calibracion || item.destinatario || "").trim(),
        tipo_instrumento: String(item.tipo_instrumento || item.tipo || "").trim(),
        updated_at: new Date().toISOString(),
      };
    });

  // 3. Upsert en lotes (chunks) a Supabase
  const total = rowsToUpsert.length;
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = rowsToUpsert.slice(i, i + chunkSize);

    const { error } = await supabase
      .from("instrumentos")
      .upsert(chunk, { onConflict: "codigo,nombre" });

    if (error) {
      throw new Error(`Error en Supabase al sincronizar lote (${i + 1}-${Math.min(i + chunkSize, total)}): ${error.message}`);
    }

    if (onProgress) {
      const processed = Math.min(i + chunkSize, total);
      onProgress(processed, total);
    }
  }

  return {
    ok: true,
    totalInstrumentos: total,
    mensaje: `✓ Sincronización exitosa: ${total} instrumentos actualizados en Supabase.`,
  };
}
