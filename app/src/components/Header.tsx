import React from "react";
import MicroLogo from "../assets/micro-logo.png"

export const Header: React.FC = () => {
  return (
    <div className="header">
      <div className="logo-wrap">
        <img src={MicroLogo} alt="MiCRO Automación" />
      </div>
      <div className="header-title">
        Seguimiento de Instrumentos &middot; Metrología
      </div>
    </div>
  );
};
