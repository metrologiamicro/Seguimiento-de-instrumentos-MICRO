import React from "react";
import { useInstruments } from "./hooks/useInstruments";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { InstrumentCard } from "./components/InstrumentCard";
import { StateMessage } from "./components/StateMessage";
import { Footer } from "./components/Footer";
import "./styles/index.css";

export const App: React.FC = () => {
  const {
    loading,
    error,
    searchQuery,
    filteredInstruments,
    handleSearch,
  } = useInstruments();

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

    return filteredInstruments.map(inst => (
      <InstrumentCard key={`${inst.codigo}-${inst.nombre}`} instrument={inst} />
    ));
  };

  return (
    <>
      <Header />
      <SearchBar onSearch={handleSearch} debounceMs={300} />
      <main className="main" id="result">
        {renderContent()}
      </main>
      <Footer />
    </>
  );
};

export default App;
