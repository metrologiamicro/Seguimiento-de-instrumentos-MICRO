import React from "react";
import type { Instrument } from "../types/instrument";
import { InstrumentService } from "../services/instrumentService";
import { formatDate } from "../utils/dateUtils";

interface InstrumentCardProps {
  instrument: Instrument;
}

const ICONS = {
  ok: "✓",
  warn: "!",
  danger: "✕",
  none: "—",
};

export const InstrumentCard: React.FC<InstrumentCardProps> = ({ instrument }) => {
  const est = InstrumentService.calculateStatus(instrument.vto, instrument.aviso);
  const dias = est.diasRemaining;

  let diasText = "";
  if (dias !== null) {
    if (dias < 0) {
      const absDias = Math.abs(dias);
      diasText = `Venció hace ${absDias} día${absDias === 1 ? "" : "s"}`;
    } else if (dias === 0) {
      diasText = "Vence hoy";
    } else {
      diasText = `${dias} día${dias === 1 ? "" : "s"} restante${dias === 1 ? "" : "s"}`;
    }
  } else {
    diasText = "Sin fecha";
  }

  return (
    <div className="card">
      <div className={`card-stripe stripe-${est.key}`}></div>
      <div className="card-body">
        <div className="card-head">
          <div className="card-meta">
            <div className="code">{instrument.codigo}</div>
            <div className="name">{instrument.nombre}</div>
          </div>
          <div className="semaforo">
            <div className={`semaforo-circle circle-${est.key}`}>
              {ICONS[est.key]}
            </div>
            <div className={`semaforo-label label-${est.key}`}>
              {est.label}
            </div>
          </div>
        </div>
        <hr className="divider" />
        <div className="card-grid">
          {instrument.sector ? (
            <div className="data-cell">
              <label>Sector</label>
              <div className="val">{instrument.sector}</div>
            </div>
          ) : null}
          <div className="data-cell">
            <label>Última calibración</label>
            <div className="val">{formatDate(instrument.calibrado) || "—"}</div>
          </div>
          <div className="data-cell">
            <label>Próxima calibración</label>
            <div className="val">{formatDate(instrument.vto) || "—"}</div>
          </div>
          <div className="data-cell">
            <label>Días restantes</label>
            <div className="val">
              <span className={`dias-pill dias-${est.key}`}>{diasText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
