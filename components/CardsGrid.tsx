// src/components/CardsGrid.tsx
import React, { useEffect, useState } from "react";
import Card from "./Card";
import { FaSolarPanel, FaChartBar, FaTools } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getCache, setCache } from "../util/cacheRegister";

interface Ticket {
  id: number;
  titulo: string;
  status: string;
  created_at: string;
  resolved_at?: string | null;
}

interface StationApi {
  id: number;
  name: string;
  networkStatus?: string;
}

interface SolplanetPlant {
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

// Interface unificada para usinas (para cálculos)
interface UnifiedStation {
  id: string | number;
  name: string;
  status: string; // "NORMAL", "OFFLINE", etc.
  integration: 'solarman' | 'solplanet';
}

const CardsGrid: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stations, setStations] = useState<StationApi[]>([]);
  const [solplanetPlants, setSolplanetPlants] = useState<SolplanetPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingSolplanet, setLoadingSolplanet] = useState(true);
  const navigate = useNavigate();

  // ------------------------------------------------------------
  // 🔹 TICKETS
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchTickets = async () => {
      const cacheKey = "@sansol/cards/tickets";

      try {
        setLoading(true);

        // 👉 1. tenta cache
        const cached = getCache<Ticket[]>(cacheKey);
        if (cached) {
          setTickets(cached);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(
          "https://backend.sansolenergiasolar.com.br/api/v1/tickets/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.clear();
            navigate("/login");
            return;
          }
          throw new Error(`Erro HTTP ${res.status}`);
        }

        const dados: Ticket[] = await res.json();

        setTickets(dados);
        setCache(cacheKey, dados); // 👉 salva no cache
      } catch (err) {
        console.error("Erro ao buscar tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [navigate]);

  // ------------------------------------------------------------
  // 🔹 USINAS SOLARMAN
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchStations = async () => {
      const cacheKey = "@sansol/cards/usinas";

      try {
        setLoadingStations(true);

        // 👉 1. tenta cache
        const cached = getCache<StationApi[]>(cacheKey);
        if (cached) {
          setStations(cached);
          setLoadingStations(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(
          "https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman/stations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.clear();
            navigate("/login");
            return;
          }
          throw new Error("Erro ao buscar usinas Solarman");
        }

        const dados: StationApi[] = await res.json();

        setStations(dados);
        setCache(cacheKey, dados); // 👉 salva no cache
      } catch (err) {
        console.error("Erro ao buscar usinas Solarman:", err);
      } finally {
        setLoadingStations(false);
      }
    };

    fetchStations();
  }, [navigate]);

  // ------------------------------------------------------------
  // 🔹 USINAS SOLPLANET
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchSolplanetPlants = async () => {
      const cacheKey = "@sansol/cards/solplanet";

      try {
        setLoadingSolplanet(true);

        // 👉 1. tenta cache
        const cached = getCache<SolplanetPlant[]>(cacheKey);
        if (cached) {
          setSolplanetPlants(cached);
          setLoadingSolplanet(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(
          "https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solplanet/plants",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.clear();
            navigate("/login");
            return;
          }
          throw new Error("Erro ao buscar usinas Solplanet");
        }

        const dados: SolplanetPlant[] = await res.json();

        setSolplanetPlants(dados);
        setCache(cacheKey, dados); // 👉 salva no cache
      } catch (err) {
        console.error("Erro ao buscar usinas Solplanet:", err);
      } finally {
        setLoadingSolplanet(false);
      }
    };

    fetchSolplanetPlants();
  }, [navigate]);

  // Combinar loading states
  const isLoading = loading || loadingStations || loadingSolplanet;

  if (isLoading) {
    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "60px 20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
          border: "1px solid #f1f5f9",
          textAlign: "center",
          color: "#64748b",
          marginTop: "20px"
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
        <p style={{ margin: 0, fontSize: "0.95rem" }}>Carregando dados...</p>

        <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    );
  }

  // --- Tickets ---
  const pendentes = tickets.filter(
    (t) => t.status === "aberto" || t.status === "emAndamento"
  );
  const resolvidos = tickets.filter(
    (t) => t.status === "resolvido" || t.status === "concluido"
  );

  const ultimoTicket = tickets.reduce((latest, t) => {
    return new Date(t.created_at) > new Date(latest.created_at) ? t : latest;
  }, tickets[0]);

  const horasDesdeUltimo = ultimoTicket
    ? Math.floor(
      (Date.now() - new Date(ultimoTicket.created_at).getTime()) /
      (1000 * 60 * 60)
    )
    : 0;

  // --- Usinas Combinadas (Solarman + Solplanet) ---
  
  // Mapeia as usinas Solarman para o formato unificado
  const solarmanUnified: UnifiedStation[] = stations.map(s => ({
    id: s.id,
    name: s.name,
    status: s.networkStatus || "DESCONHECIDO",
    integration: 'solarman'
  }));

  // Mapeia as usinas Solplanet para o formato unificado
  const solplanetUnified: UnifiedStation[] = solplanetPlants.map(p => ({
    id: p.apikey,
    name: p.name,
    status: p.status === 1 ? "NORMAL" : p.status === 0 ? "OFFLINE" : "ALERT",
    integration: 'solplanet'
  }));

  // Combina todas as usinas
  const todasUsinas: UnifiedStation[] = [...solarmanUnified, ...solplanetUnified];

  // Calcula os status
  const ativas = todasUsinas.filter(
    (s) => s.status === "NORMAL" || s.status === "ONLINE"
  ).length;
  
  const parcial = todasUsinas.filter(
    (s) => s.status === "PARTIAL_OFFLINE"
  ).length;
  
  const inativas = todasUsinas.filter(
    (s) => s.status === "OFFLINE" || s.status === "ALL_OFFLINE"
  ).length;

  const totalUsinas = todasUsinas.length;

  // Calcula usinas por integração
  const totalSolarman = solarmanUnified.length;
  const totalSolplanet = solplanetUnified.length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        marginTop: "20px",
      }}
    >
      {/* === Card 1: Usinas === */}
      <Card
        icon={<FaSolarPanel size={28} color="#ff7a2d" />}
        title="Resumo de Usinas"
        value={`${ativas} Ativa${ativas !== 1 ? 's' : ''}`}
        sub={
          <>
            <div>Total de usinas: <strong>{totalUsinas}</strong></div>
            <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
              <span style={{ color: '#666' }}>Solarman: {totalSolarman} | Solplanet: {totalSolplanet}</span>
            </div>
            <div style={{ marginTop: '8px' }}>
              <div>Parcialmente offline: <strong>{parcial}</strong></div>
              <div>Offline: <strong>{inativas}</strong></div>
            </div>
          </>
        }
      />

      {/* === Card 2: Relatórios (placeholder por enquanto) === */}
      <Card
        icon={<FaChartBar size={28} color="#ff7a2d" />}
        title="Relatórios"
        value="0 Relatórios"
        sub={
          <>
            <div>Último enviado: <strong>15/10/2025</strong></div>
            <div>Status: <strong>Atualizado</strong></div>
          </>
        }
      />

      {/* === Card 3: Tickets === */}
      <Card
        icon={<FaTools size={28} color="#ff7a2d" />}
        title="Tickets de Manutenção"
        value={`${pendentes.length} Pendente${pendentes.length !== 1 ? 's' : ''}`}
        sub={
          <>
            <div>Resolvidos: <strong>{resolvidos.length}</strong></div>
            <div>Último ticket: <strong>há {horasDesdeUltimo}h</strong></div>
          </>
        }
      />
    </div>
  );
};

export default CardsGrid;