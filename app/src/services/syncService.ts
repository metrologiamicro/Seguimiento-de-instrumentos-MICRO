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
  const tInicio = performance.now();
  console.log("🔄 [SYNC] Iniciando proceso de sincronización...");

  try {
    const scriptUrl = import.meta.env.VITE_SCRIPT_URL || "";
    const rawChunkSize = import.meta.env.VITE_SYNC_CHUNK_SIZE;
    const chunkSize = Number(rawChunkSize) > 0 ? Number(rawChunkSize) : 500;

    if (!scriptUrl) {
      throw new Error("No se encuentra definida la variable VITE_SCRIPT_URL.");
    }

    if (!supabase) {
      throw new Error("Cliente de Supabase no disponible.");
    }

    // 1. Obtener catálogo desde Google Apps Script
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
    console.log(`📡 [SYNC] Google Sheets: ${instrumentosGS.length} registros recibidos.`);

    // 2. Normalizar y asegurar unicidad por Clave Compuesta (codigo + nombre)
    const uniqueRowsMap = new Map<string, any>();

    for (const item of instrumentosGS) {
      const cod = String(item.codigo || item.c || "").trim();
      const nom = String(item.nombre || item.n || "").trim();
      if (!cod || !nom) continue;

      const compositeKey = `${cod.toUpperCase()}|||${nom.toUpperCase()}`;
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

      const row = {
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

      if (uniqueRowsMap.has(compositeKey)) {
        const prev = uniqueRowsMap.get(compositeKey);
        if (!prev.fecha_vencimiento_calibracion && row.fecha_vencimiento_calibracion) {
          uniqueRowsMap.set(compositeKey, row);
        }
      } else {
        uniqueRowsMap.set(compositeKey, row);
      }
    }

    const rowsToUpsert = Array.from(uniqueRowsMap.values());
    const total = rowsToUpsert.length;
    const totalChunks = Math.ceil(total / chunkSize);

    // 3. Upsert en lotes a Supabase
    for (let i = 0; i < total; i += chunkSize) {
      const chunk = rowsToUpsert.slice(i, i + chunkSize);

      const { error } = await supabase
        .from("instrumentos")
        .upsert(chunk, { onConflict: "codigo,nombre" });

      if (error) {
        console.error("❌ [SYNC] Error en Supabase:", error.message);
        throw new Error(`Error en Supabase al sincronizar datos: ${error.message}`);
      }

      if (onProgress) {
        const processed = Math.min(i + chunkSize, total);
        onProgress(processed, total);
      }
    }

    console.log(`🚀 [SYNC] Supabase: ${total} registros unificados actualizados correctamente en ${totalChunks} lote(s).`);

    const tTotal = ((performance.now() - tInicio) / 1000).toFixed(2);
    console.log(`✅ [SYNC] Sincronización completada con éxito en ${tTotal}s.`);

    return {
      ok: true,
      totalInstrumentos: total,
      mensaje: `✓ Sincronización exitosa: ${total} instrumentos actualizados en Supabase.`,
    };
  } catch (err: any) {
    console.error(`💥 [SYNC] Falla en sincronización:`, err.message || err);

    return {
      ok: false,
      totalInstrumentos: 0,
      mensaje: `Error al sincronizar: ${err.message || err}`,
      error: err.message || String(err),
    };
  }
}
