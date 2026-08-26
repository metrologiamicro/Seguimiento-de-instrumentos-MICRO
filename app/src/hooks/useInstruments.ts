import { useState, useEffect, useCallback, useRef } from "react";
import type { Instrument } from "../types/instrument";
import { InstrumentService } from "../services/instrumentService";

export function useInstruments() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    InstrumentService.fetchInstruments()
      .then(data => {
        if (isMounted) {
          setInstruments(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || "Error al cargar la planilla");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(newQuery);
    }, 260);
  }, []);

  const filteredInstruments = InstrumentService.filterInstruments(instruments, debouncedQuery);

  return {
    loading,
    error,
    query,
    debouncedQuery,
    filteredInstruments,
    totalCount: instruments.length,
    handleQueryChange,
  };
}
