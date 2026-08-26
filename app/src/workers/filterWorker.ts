import type { Instrument } from "../types/instrument";

export type WorkerMessage =
  | { type: "INIT_DATA"; payload: Instrument[] }
  | { type: "FILTER"; payload: string };

export type WorkerResponse =
  | { type: "FILTER_RESULT"; payload: Instrument[]; query: string };

let allInstruments: Instrument[] = [];

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  if (type === "INIT_DATA") {
    allInstruments = payload;
    return;
  }

  if (type === "FILTER") {
    const q = payload.trim().toLowerCase();
    if (!q) {
      const response: WorkerResponse = {
        type: "FILTER_RESULT",
        payload: [],
        query: payload,
      };
      self.postMessage(response);
      return;
    }

    const filtered = allInstruments.filter(
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

    const response: WorkerResponse = {
      type: "FILTER_RESULT",
      payload: filtered,
      query: payload,
    };
    self.postMessage(response);
  }
};
