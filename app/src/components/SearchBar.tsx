import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="search-zone">
      <div className="search-box">
        <span className="search-icon">&#128269;</span>
        <input
          type="text"
          id="buscar"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Código, nombre o sector…"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
