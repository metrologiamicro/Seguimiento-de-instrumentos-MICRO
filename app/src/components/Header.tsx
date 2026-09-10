import React from "react";
import MicroLogo from "../assets/micro-logo.png";
import type { Theme } from "../types/theme";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onSync,
  isSyncing = false,
}) => {
  const a = onSync //Para evitar errores por el boton comentado
  const b = isSyncing //Para evitar errores por el boton comentado
  if(a && b) console.log("Sincronizacion desactivada")
  
  return (
    <header className="header">
      <div className="hdr-left">
        <div className="logo-wrap">
          <img src={MicroLogo} alt="MiCRO Automación" className="hdr-logo" />
        </div>
      </div>

      <div className="header-title">
        Seguimiento de Instrumentos &middot; Metrología
      </div>

      <div className="hdr-right">
        {/*onSync && (
          <button
            className={`hdr-btn sync-btn ${isSyncing ? "spinning" : ""}`}
            onClick={onSync}
            disabled={isSyncing}
            title={isSyncing ? "Sincronizando con Google Sheets…" : "Sincronizar datos (Google Sheets ↔ Supabase)"}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.4" fill="none">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
          </button>
        )*/}

        <button
          className="hdr-btn theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === "light" ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
        >
          {theme === "light" ? (
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
