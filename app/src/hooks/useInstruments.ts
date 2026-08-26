import { useState, useEffect, useCallback } from "react";
import type { Instrument } from "../types/instrument";
import { InstrumentService } from "../services/instrumentService";

export function useInstruments() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
          setError(err.message || "Error al cargar los instrumentos");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredInstruments = InstrumentService.filterInstruments(instruments, searchQuery);

  return {
    loading,
    error,
    searchQuery,
    filteredInstruments,
    totalCount: instruments.length,
    handleSearch,
  };
}
