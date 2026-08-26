import React from "react";

interface StateMessageProps {
  type: "loading" | "initial" | "empty" | "error";
  query?: string;
  errorMessage?: string;
}

export const StateMessage: React.FC<StateMessageProps> = ({ type, query, errorMessage }) => {
  if (type === "loading") {
    return (
      <div className="msg">
        <div className="spinner"></div>
        <p>Cargando planilla…</p>
      </div>
    );
  }

  if (type === "initial") {
    return (
      <div className="msg">
        <div className="icon">&#128203;</div>
        <strong>Consultá el estado de cualquier instrumento</strong>
        <p>
          Ingresá el código, nombre o sector para ver
          <br />
          la aptitud de uso y fechas de calibración.
        </p>
      </div>
    );
  }

  if (type === "empty") {
    return (
      <div className="msg">
        <div className="icon">&#128269;</div>
        <strong>Sin resultados</strong>
        <p>
          No se encontró "<b>{query}</b>".
        </p>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="msg">
        <div className="icon">&#9888;</div>
        <strong>No se pudo cargar</strong>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return null;
};
