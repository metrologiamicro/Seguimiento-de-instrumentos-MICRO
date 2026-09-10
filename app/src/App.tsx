import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useInstruments } from "./hooks/useInstruments";
import { useTheme } from "./hooks/useTheme";
import { useToast } from "./hooks/useToast";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { InstrumentCard } from "./components/InstrumentCard";
import { StateMessage } from "./components/StateMessage";
import { ToastNotification } from "./components/ToastNotification";
import { Footer } from "./components/Footer";
import { sincronizarGoogleSheetsConSupabase } from "./services/syncService";
import "./styles/index.css";

const PAGE_SIZE = 30;

export const App: React.FC = () => {
  const {
    loading,
    error,
    searchQuery,
    filteredInstruments,
    handleSearch,
    reloadInstruments,
  } = useInstruments();

  const { theme, toggleTheme } = useTheme();
  const { toasts, showToast, dismissToast } = useToast();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Forzar título de la pestaña y desregistrar cualquier Service Worker / PWA previo alojado en el mismo puerto
  useEffect(() => {
    document.title = "Seguimiento de Instrumentos • MiCRO Automación";

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
  }, []);

  // Reiniciar la cantidad de items visibles al cambiar la búsqueda o el resultado
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, filteredInstruments.length]);

  // Recortar únicamente los primeros N items para que el DOM no se congele
  const displayedInstruments = useMemo(() => {
    return filteredInstruments.slice(0, visibleCount);
  }, [filteredInstruments, visibleCount]);

  const hasMore = visibleCount < filteredInstruments.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const handleSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const syncToastId = "sync-progress";

    showToast("Iniciando sincronización con Google Sheets…", "info", 5000, syncToastId);
    try {
      const res = await sincronizarGoogleSheetsConSupabase((processed, total) => {
        showToast(`Procesando sincronización: ${processed}/${total}`, "info", 5000, syncToastId);
      });
      if (res.ok) {
        showToast(res.mensaje.replace(/^✓\s*/, ""), "success", 4500, syncToastId);
        await reloadInstruments();
      } else {
        showToast(res.mensaje, "warn", 5000, syncToastId);
      }
    } catch (e: any) {
      showToast(`Error de sincronización: ${e.message || e}`, "error", 5000, syncToastId);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, showToast, reloadInstruments]);

  const renderContent = () => {
    if (loading) {
      return <StateMessage type="loading" />;
    }

    if (error) {
      return <StateMessage type="error" errorMessage={error} />;
    }

    if (!searchQuery.trim()) {
      return <StateMessage type="initial" />;
    }

    if (filteredInstruments.length === 0) {
      return <StateMessage type="empty" query={searchQuery} />;
    }

    return (
      <>
        {displayedInstruments.map((inst) => (
          <InstrumentCard key={`${inst.codigo}-${inst.nombre}`} instrument={inst} />
        ))}
        {hasMore && (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <button
              onClick={handleLoadMore}
              style={{
                background: "var(--micro-blue)",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(1, 178, 254, 0.3)",
              }}
            >
              Cargar más resultados (Quedan {filteredInstruments.length - visibleCount})
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="sticky-top-zone">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onSync={handleSync}
          isSyncing={isSyncing}
        />
        <SearchBar onSearch={handleSearch} debounceMs={250} />
      </div>
      <main className="main" id="result">
        {renderContent()}
      </main>
      <Footer />
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default App;
