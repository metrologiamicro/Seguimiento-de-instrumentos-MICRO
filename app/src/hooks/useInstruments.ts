import { useState, useEffect, useCallback, useRef } from "react";
import type { Instrument } from "../types/instrument";
import { InstrumentService } from "../services/instrumentService";
import type { WorkerResponse } from "../workers/filterWorker";

export function useInstruments() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredInstruments, setFilteredInstruments] = useState<Instrument[]>([]);

  const workerRef = useRef<Worker | null>(null);

  // Inicializar Web Worker en un hilo secundario
  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/filterWorker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, payload } = event.data;
      if (type === "FILTER_RESULT") {
        setFilteredInstruments(payload);
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await InstrumentService.fetchInstruments();
      setInstruments(data);
      setLoading(false);

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: "INIT_DATA",
          payload: data,
        });
        if (searchQuery) {
          workerRef.current.postMessage({
            type: "FILTER",
            payload: searchQuery,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar los instrumentos");
      setLoading(false);
    }
  }, [searchQuery]);

  // Carga inicial de datos desde Supabase
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Manejador de búsqueda que delega el filtrado al Web Worker
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: "FILTER",
        payload: query,
      });
    }
  }, []);

  return {
    loading,
    error,
    searchQuery,
    filteredInstruments,
    totalCount: instruments.length,
    handleSearch,
    reloadInstruments: loadData,
  };
}
