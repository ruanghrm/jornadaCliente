import React, { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
import ModalUsinas from "../components/ModalUsinas";
import { getCache, setCache } from "../util/cacheRegister";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value);

interface Unidade {
  id: number;
  cliente: string;
  capacidade: string;
  endereco: string;
  status: string;
  geracao: string;
  apikey?: string;
}

interface StationApi {
  id: number;
  name: string;
  installedCapacity?: number;
  locationAddress?: string;
  networkStatus?: string;
  generationPower?: number;
}

interface SolplanetApi {
  apikey: string;
  name: string;
  status: number;
  totalpower_kw: number;
  etoday_kwh: number;
  etotal_kwh: number;
  ludt: string;
  wd: number;
  jd: number;
  position: string;
}

const INTEGRACOES = {
  solarman:
    "https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman/stations",
  sungrow:
    "https://backend.sansolenergiasolar.com.br/api/v1/integracoes/sungrow/plants",
  solplanet:
    "https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solplanet/plants",
};

const Unidades: React.FC = () => {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [usinaSelecionada, setUsinaSelecionada] = useState<Unidade | null>(null); // ← Mudou aqui
  const [integracao, setIntegracao] = useState<keyof typeof INTEGRACOES>("solarman");

  const carregarUsinas = useCallback(async () => {
    const cacheKey = `@sansol/usinas/${integracao}`;

    try {
      setErro(null);
      setLoading(true);

      // Tenta buscar do cache primeiro
      const cached = getCache<Unidade[]>(cacheKey);
      if (cached) {
        setUnidades(cached);
        setLoading(false);
        return;
      }

      // Se não tem cache, faz fetch
      const url = INTEGRACOES[integracao];
      const res = await fetch(url);

      if (!res.ok) throw new Error("Erro ao buscar usinas");

      const json = await res.json();

      let dados: Unidade[] = [];

      if (integracao === "solplanet") {
        const plants: SolplanetApi[] = json;
        dados = plants.map((p, index) => ({
          id: index + 1, // ID sequencial para a tabela, mas ainda temos a apikey no cache
          cliente: p.name,
          capacidade: `${formatNumber(p.totalpower_kw)} kWp`,
          endereco: p.position ?? "-",
          status: p.status === 1 ? "Online" : "Offline",
          geracao: `${formatNumber(p.etoday_kwh)} kWh`,
          apikey: p.apikey
          // Não perdemos a apikey porque ela está no cache
        }));
      } else {
        const stations: StationApi[] = json;
        dados = stations.map((s) => ({
          id: s.id,
          cliente: s.name,
          capacidade: typeof s.installedCapacity === "number"
            ? `${formatNumber(s.installedCapacity)} kWp`
            : "-",
          endereco: s.locationAddress ?? "-",
          status: s.networkStatus ?? "-",
          geracao: typeof s.generationPower === "number"
            ? `${formatNumber(s.generationPower)} kW`
            : "-",
        }));
      }

      setUnidades(dados);
      setCache(cacheKey, dados);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado.";
      setErro(message);
    } finally {
      setLoading(false);
    }
  }, [integracao]);

  useEffect(() => {
    carregarUsinas();
  }, [carregarUsinas]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2>Unidades Consumidoras</h2>
        <p className="muted">Lista completa das usinas monitoradas</p>
      </div>

      {/* DROPDOWN DE INTEGRAÇÕES */}
      <div style={{ marginBottom: 15 }}>
        <select
          value={integracao}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setIntegracao(e.target.value as keyof typeof INTEGRACOES)
          }
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
          }}
        >
          <option value="solarman">Solarman</option>
          <option value="sungrow">Sungrow</option>
          <option value="solplanet">Solplanet</option>
        </select>
      </div>

      {/* ÚNICO LOADING LARANJA */}
      {loading && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "60px 20px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
            border: "1px solid #f1f5f9",
            textAlign: "center",
            color: "#64748b",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #f1f5f9",
              borderTop: "3px solid #ff7a2d",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px auto",
            }}
          />
          <p style={{ margin: 0, fontSize: "0.95rem" }}>
            Buscando usinas da {integracao}...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      {!loading && !erro && (
        <>
          <Table
            data={unidades}
            columns={["cliente", "capacidade", "endereco", "status", "geracao"]}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            onCellClick={(row: Unidade) => setUsinaSelecionada(row)} // ← Passa a linha completa
          />

          {/* MODAL SEM LOADING PRÓPRIO */}
          {usinaSelecionada && (
            <ModalUsinas
              unidade={usinaSelecionada} // ← Passa a unidade completa
              onClose={() => setUsinaSelecionada(null)}
              unidadesCache={unidades}
              integracao={integracao}
            />
          )}

          <div style={{ textAlign: "right", marginTop: 10, color: "#777" }}>
            Total de {unidades.length} unidades
          </div>
        </>
      )}
    </div>
  );
};

export default Unidades;