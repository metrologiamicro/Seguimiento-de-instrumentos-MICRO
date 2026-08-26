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

export const InstrumentCard: React.FC<InstrumentCardProps> = React.memo(({ instrument }) => {
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

  const isEnUso = instrument.disponibilidad?.trim().toUpperCase() === "EN USO";

  return (
    <div className="card">
      <div className={`card-stripe stripe-${est.key}`}></div>
      <div className="card-body">
        {/* ENCABEZADO DE LA CARD: Código, Badge ID y Semáforo de Aptitud */}
        <div className="card-head">
          <div className="card-meta">
            <div className="code-row">
              <span className="code">{instrument.codigo}</span>
              {instrument.identificacion && (
                <span className="id-pill" title="Identificación del instrumento">
                  ID: {instrument.identificacion}
                </span>
              )}
            </div>
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

        {/* BLOQUE DE NOMBRE / DESCRIPCIÓN COMPLETA */}
        <div className="name-block">
          <label>Nombre / Descripción Completa</label>
          <div className="name-val">{instrument.nombre}</div>
        </div>

        {/* GRILLA DE DATOS TÉCNICOS EN CAJAS */}
        <div className="card-grid">
          {instrument.tipoInstrumento ? (
            <div className="field-box">
              <label>Tipo de Instrumento</label>
              <div className="val">{instrument.tipoInstrumento}</div>
            </div>
          ) : null}

          {instrument.operarioMarca ? (
            <div className="field-box">
              <label>Marca / Marca Operario</label>
              <div className="val">{instrument.operarioMarca}</div>
            </div>
          ) : null}

          {instrument.sector ? (
            <div className="field-box">
              <label>Sector Asignado</label>
              <div className="val">{instrument.sector}</div>
            </div>
          ) : null}

          <div className="field-box">
            <label>Última Calibración</label>
            <div className="val">{formatDate(instrument.calibrado) || "—"}</div>
          </div>

          <div className="field-box">
            <label>Próximo Vencimiento</label>
            <div className="val">{formatDate(instrument.vto) || "—"}</div>
          </div>

          <div className="field-box">
            <label>Días Restantes</label>
            <div className="val">
              <span className={`dias-pill dias-${est.key}`}>{diasText}</span>
            </div>
          </div>

          {instrument.disponibilidad ? (
            <div className="field-box">
              <label>Disponibilidad</label>
              <div className="val">
                <span className={`dispo-badge ${isEnUso ? "dispo-en-uso" : "dispo-disponible"}`}>
                  {instrument.disponibilidad}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* BLOQUE RESUMIDO DE CUSTODIA Y RETIRO (Máquina / Operario cuando posee datos o está EN USO) */}
        {(instrument.maquina || isEnUso) && (
          <div className="custodia-box">
            <div className="custodia-title">Información de Custodia y Retiro</div>
            <div className="custodia-grid">
              {instrument.maquina ? (
                <div className="custodia-row">
                  <span className="lbl">Máquina / Destino:</span>
                  <span className="val bold">{instrument.maquina}</span>
                </div>
              ) : null}
              {instrument.retiradoPor ? (
                <div className="custodia-row">
                  <span className="lbl">Retirado por:</span>
                  <span className="val">{instrument.retiradoPor}</span>
                </div>
              ) : null}
              {instrument.fechaRetiro ? (
                <div className="custodia-row">
                  <span className="lbl">Fecha Retiro:</span>
                  <span className="val mono">{instrument.fechaRetiro}</span>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
