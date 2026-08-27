import type { Instrument } from "../types/instrument";

export type WorkerMessage =
  | { type: "INIT_DATA"; payload: Instrument[] }
  | { type: "FILTER"; payload: string };

export type WorkerResponse =
  | { type: "FILTER_RESULT"; payload: Instrument[]; query: string };

let allInstruments: Instrument[] = [];

function matchesQuery(
  val: string | undefined | null,
  rawQuery: string,
  strippedQuery: string,
  queryWords: string[]
): boolean {
  if (!val) return false;
  const lowerVal = val.toLowerCase();
  const strippedVal = lowerVal.replace(/\s+/g, "");

  // 1. Coincidencia ignorando espacios por completo (ej: "M4X0,7" == "M 4 X 0 , 7")
  if (strippedVal.includes(strippedQuery)) return true;

  // 2. Coincidencia directa con la consulta original
  if (lowerVal.includes(rawQuery)) return true;

  // 3. Coincidencia por palabras individuales
  if (queryWords.length > 1) {
    return queryWords.every(
      w => lowerVal.includes(w) || strippedVal.includes(w)
    );
  }

  return false;
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  if (type === "INIT_DATA") {
    allInstruments = payload;
    return;
  }

  if (type === "FILTER") {
    const rawQuery = payload.trim().toLowerCase();
    if (!rawQuery) {
      const response: WorkerResponse = {
        type: "FILTER_RESULT",
        payload: [],
        query: payload,
      };
      self.postMessage(response);
      return;
    }

    const strippedQuery = rawQuery.replace(/\s+/g, "");
    const queryWords = rawQuery.split(/\s+/).filter(Boolean);

    const filtered = allInstruments.filter(i =>
      matchesQuery(i.codigo, rawQuery, strippedQuery, queryWords) ||
      matchesQuery(i.nombre, rawQuery, strippedQuery, queryWords) ||
      matchesQuery(i.sector, rawQuery, strippedQuery, queryWords) ||
      matchesQuery(i.operarioMarca, rawQuery, strippedQuery, queryWords) ||
      matchesQuery(i.disponibilidad, rawQuery, strippedQuery, queryWords) ||
      matchesQuery(i.identificacion, rawQuery, strippedQuery, queryWords) ||
      matchesQuery(i.tipoInstrumento, rawQuery, strippedQuery, queryWords) ||
      matchesQuery(i.maquina, rawQuery, strippedQuery, queryWords)
    );

    const response: WorkerResponse = {
      type: "FILTER_RESULT",
      payload: filtered,
      query: payload,
    };
    self.postMessage(response);
  }
};
