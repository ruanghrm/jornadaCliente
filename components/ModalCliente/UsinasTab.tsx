import React, { useState, useEffect, useRef } from "react";
import type { StationInfo as Usina } from "../Usinas/types";
import "./UsinasTab.css";

interface UsinasTabProps {
  clienteId: number;
  usinasAssociadas: Usina[];
  onAssociarUsina: (usina: Usina) => Promise<void>;
  onDesassociarUsina: (usina: Usina) => Promise<void>;
  onBuscarUsinas: (filtro: string) => Promise<Usina[]>;
}

export const UsinasTab: React.FC<UsinasTabProps> = ({
  usinasAssociadas,
  onAssociarUsina,
  onDesassociarUsina,
  onBuscarUsinas
}) => {
  const [termoBusca, setTermoBusca] = useState("");
  const [termoBuscaOriginal, setTermoBuscaOriginal] = useState(""); // Novo estado
  const [resultadosBusca, setResultadosBusca] = useState<Usina[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [associandoId, setAssociandoId] = useState<string | null>(null);
  const [removendoId, setRemovendoId] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<Usina[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && event.target instanceof Node && !searchRef.current.contains(event.target)) {
        setMostrarSugestoes(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (termoBusca.length < 3) {
      setSugestoes([]);
      setMostrarSugestoes(false);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setBuscando(true);
        const resultados = await onBuscarUsinas(termoBusca);
        setSugestoes(Array.isArray(resultados) ? resultados : []);
        setMostrarSugestoes(true);
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
      } finally {
        setBuscando(false);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [termoBusca, onBuscarUsinas]);

  const handleBuscaCompleta = async (termoParaBuscar?: string) => {
    const termo = termoParaBuscar || termoBusca;
    if (!termo.trim()) return;

    try {
      setBuscando(true);
      setTermoBuscaOriginal(termo); // Salva o termo original usado na busca
      const resultados = await onBuscarUsinas(termo);
      setResultadosBusca(Array.isArray(resultados) ? resultados : []);
      setMostrarResultados(true);
      setMostrarSugestoes(false);
    } catch (error) {
      console.error("Erro ao buscar usinas:", error);
      setResultadosBusca([]);
    } finally {
      setBuscando(false);
    }
  };

  const handleSugestaoClick = (usina: Usina) => {
    setTermoBusca(usina.name);
    setMostrarSugestoes(false);
    // Usa o nome completo da usina para a busca
    handleBuscaCompleta(usina.name);
  };

  const handleAssociar = async (usina: Usina) => {
    setAssociandoId(usina.id);
    try {
      await onAssociarUsina(usina);
      setResultadosBusca(prev => prev.filter(u => u.id !== usina.id));
      setSugestoes(prev => prev.filter(u => u.id !== usina.id));
    } finally {
      setAssociandoId(null);
    }
  };

  const handleDesassociar = async (usina: Usina) => {
    setRemovendoId(usina.id);
    try {
      await onDesassociarUsina(usina);
    } finally {
      setRemovendoId(null);
    }
  };

  const getFonteConfig = (fonte?: string) => {
    if (fonte === "Solplanet") {
      return {
        cor: "#fa8c16",
        bg: "#fff7ed",
        gradient: "linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)",
        label: "SOLPLANET"
      };
    }
    if (fonte === "Solarman") {
      return {
        cor: "#1677ff",
        bg: "#eff6ff",
        gradient: "linear-gradient(135deg, #1677ff 0%, #4096ff 100%)",
        label: "SOLARMAN"
      };
    }
    return {
      cor: "#64748b",
      bg: "#f1f5f9",
      gradient: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)",
      label: "OUTRA"
    };
  };

  const ResultadoBuscaCard = ({ usina, onAction }: { usina: Usina; onAction: () => void }) => {
    const fonteConfig = getFonteConfig(usina.fonte);
    const isProcessing = associandoId === usina.id;

    return (
      <div className={`usina-card resultado-card ${isProcessing ? 'processing' : ''}`}>
        <div 
          className="card-color-bar" 
          style={{ background: fonteConfig.gradient }}
        />
        <div className="card-content">
          <div className="card-header">
            <div>
              <h4 className="card-title">{usina.name}</h4>
              <div className="card-id">ID: {usina.id}</div>
            </div>
            <div 
              className="fonte-badge"
              style={{
                background: fonteConfig.bg,
                color: fonteConfig.cor,
                borderColor: `${fonteConfig.cor}30`
              }}
            >
              {fonteConfig.label}
            </div>
          </div>

          <div className="card-info">
            <div className="card-info-item">
              <span className="card-info-icon">📍</span>
              <span className="card-info-text">
                {usina.locationAddress || "Local não informado"}
              </span>
            </div>
            <div className="card-info-item">
              <span className="card-info-icon">⚡</span>
              <span>
                {usina.installedCapacity ? `${usina.installedCapacity} kWp` : 
                 usina.generationPower ? `${usina.generationPower} W` : 
                 "Capacidade não informada"}
              </span>
            </div>
          </div>

          <div className="card-actions">
            <button
              onClick={onAction}
              disabled={isProcessing}
              className="btn-associar"
              style={{
                borderColor: fonteConfig.cor,
                color: fonteConfig.cor
              }}
            >
              {isProcessing ? "Associando..." : "➕ Associar"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const UsinaAssociadaCard = ({ usina, onAction }: { usina: Usina; onAction: () => void }) => {
    const fonteConfig = getFonteConfig(usina.fonte);
    const isProcessing = removendoId === usina.id;

    return (
      <div className={`usina-card associada-card ${isProcessing ? 'processing' : ''}`}>
        <div 
          className="card-color-bar" 
          style={{ background: fonteConfig.gradient }}
        />
        <div className="card-content">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.25rem"
              }}>
                <h4 className="card-title">
                  {usina.name}
                </h4>
                <div 
                  className="fonte-badge"
                  style={{
                    background: fonteConfig.bg,
                    color: fonteConfig.cor,
                    borderColor: `${fonteConfig.cor}30`
                  }}
                >
                  {fonteConfig.label}
                </div>
              </div>
              <div className="card-id">
                ID: {usina.id}
              </div>
            </div>

            <button
              onClick={onAction}
              disabled={isProcessing}
              className="btn-remover"
            >
              {isProcessing ? "..." : "✕ Remover"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="usinas-tab-container">
      {/* SEÇÃO DE BUSCA */}
      <div className="usinas-section section-busca">
        <h3>Associar Nova Usina</h3>

        <div ref={searchRef} className="search-container">
          <div className="search-wrapper">
            <div className="search-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder="Digite nome, ID ou localização..."
                value={termoBusca}
                onChange={(e) => {
                  setTermoBusca(e.target.value);
                  setMostrarResultados(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleBuscaCompleta()}
                onFocus={() => termoBusca.length >= 3 && setMostrarSugestoes(true)}
              />
              {buscando && <div className="search-spinner" />}
            </div>

            <button
              onClick={() => handleBuscaCompleta()}
              disabled={buscando}
              className="search-button"
            >
              {buscando ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {mostrarSugestoes && sugestoes.length > 0 && !mostrarResultados && (
            <div className="suggestions-dropdown">
              {sugestoes.map((usina) => {
                const fonteConfig = getFonteConfig(usina.fonte);
                const isAssociada = usinasAssociadas.some(a => a.id === usina.id);
                
                return (
                  <div
                    key={usina.id}
                    className="suggestion-item"
                    onClick={() => handleSugestaoClick(usina)}
                    style={{
                      opacity: isAssociada ? 0.5 : 1,
                      cursor: isAssociada ? 'default' : 'pointer'
                    }}
                  >
                    <div className="suggestion-title">
                      {usina.name}
                      {isAssociada && <span style={{ marginLeft: '8px', color: '#10b981' }}>✓ Já associada</span>}
                    </div>
                    <div className="suggestion-details">
                      <span>ID: {usina.id}</span>
                      <span style={{ color: fonteConfig.cor }}>{fonteConfig.label}</span>
                      {usina.locationAddress && <span>📍 {usina.locationAddress}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {mostrarResultados && (
          <div style={{ marginTop: "1.5rem" }}>
            <div className="results-header">
              <h4>
                Resultados para <span style={{ color: '#FF7A2D' }}>"{termoBuscaOriginal}"</span>
              </h4>
              <span className="results-count">{resultadosBusca.length} encontrada(s)</span>
            </div>

            {resultadosBusca.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-title">
                  Nenhuma usina encontrada para "{termoBuscaOriginal}"
                </p>
                <p className="empty-state-subtitle">
                  Tente buscar por nome, ID ou localização diferente
                </p>
              </div>
            ) : (
              <div className="cards-grid">
                {resultadosBusca.map((usina) => (
                  <ResultadoBuscaCard
                    key={usina.id}
                    usina={usina}
                    onAction={() => handleAssociar(usina)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEÇÃO DE USINAS ASSOCIADAS */}
      <div className="usinas-section section-associadas">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem"
        }}>
          <h3 style={{ margin: 0 }}>Usinas Associadas</h3>
          <span className="results-count" style={{
            background: "#d1fae5",
            color: "#059669"
          }}>
            {usinasAssociadas.length} usina(s)
          </span>
        </div>

        {usinasAssociadas.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">Nenhuma usina associada</p>
            <p className="empty-state-subtitle">
              Use a busca acima para encontrar e associar usinas
            </p>
          </div>
        ) : (
          <div className="cards-grid associadas-grid">
            {usinasAssociadas.map((usina) => (
              <UsinaAssociadaCard
                key={usina.id}
                usina={usina}
                onAction={() => handleDesassociar(usina)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};