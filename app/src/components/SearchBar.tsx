import React, { useState, useEffect, useRef } from "react";

interface SearchBarProps {
  initialValue?: string;
  onSearch: (debouncedValue: string) => void;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = "",
  onSearch,
  debounceMs = 300,
}) => {
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val); // Actualización inmediata del input para 0ms de lag de escritura

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onSearch(val); // Dispara el filtrado tras el retardo especificado
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="search-zone">
      <div className="search-box">
        <span className="search-icon">&#128269;</span>
        <input
          type="text"
          id="buscar"
          value={value.toUpperCase()}
          onChange={handleChange}
          placeholder="Código, nombre o sector…"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
