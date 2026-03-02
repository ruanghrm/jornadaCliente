import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import ModalNovoTicket from "../components/ModalNovoTicket";
import ModalTicketMonitoring from "../components/ModalTicketMonitoring";
import type { Ticket, Tag, TicketAPI } from "../src/types";
import { useNavigate } from "react-router-dom";
import TagBadge from "../components/TagBadge";

// ------------------ COMPONENTE ------------------
const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticketSelecionado, setTicketSelecionado] = useState<Ticket | null>(null);
  const [filtro, setFiltro] = useState("todos");
  const [modalNovoTicketOpen, setModalNovoTicketOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const [clienteTagsMap, setClienteTagsMap] = useState<Record<number, Tag[]>>({});
  const [ticketTagsMap, setTicketTagsMap] = useState<Record<number, Tag[]>>({});
  const navigate = useNavigate();

  // ------------------ RESPONSIVIDADE ------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Limpeza
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ------------------ DETERMINAR COLUNAS BASEADO NA LARGURA DA TELA ------------------
  const getColumns = (): ("ações" | keyof Ticket)[] => {
    // Mobile (telas muito pequenas)
    if (windowWidth < 640) {
      return ["titulo", "cliente", "status"];
    }
    // Tablet
    else if (windowWidth < 1024) {
      return ["titulo", "cliente", "status", "criacao"];
    }
    // Desktop
    else {
      return ["titulo", "cliente", "responsaveis", "status", "tipo", "criacao"];
    }
  };

  // ------------------ FETCH TICKETS ------------------
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Token não encontrado");
        }

        const response = await fetch(
          "https://backend.sansolenergiasolar.com.br/api/v1/tickets/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.clear();
            navigate("/login");
            return;
          }

          throw new Error(`Erro HTTP ${response.status}`);
        }

        const dadosRaw: TicketAPI[] = await response.json();

        const dados: Ticket[] = dadosRaw.map(t => ({
          id: t.id,
          titulo: t.titulo,
          descricao: t.descricao,
          prioridade: t.prioridade,
          categoria: t.categoria,
          usina: "",
          cliente: t.cliente_nome,
          status:
            t.status === "aberto"
              ? "Em Andamento"
              : t.status === "concluido"
                ? "Concluído"
                : t.status,
          tipo: t.categoria ?? "",
          responsaveis: "",
          criacao: new Date(t.created_at).toLocaleDateString(),
          prazo: t.resolved_at
            ? new Date(t.resolved_at).toLocaleDateString()
            : "",
          cliente_id: t.cliente_id,
        }));

        let filtrados = dados;
        if (filtro === "emAndamento")
          filtrados = dados.filter(t => t.status === "Em Andamento");
        if (filtro === "concluidos")
          filtrados = dados.filter(t => t.status === "Concluído");

        setTickets(filtrados);
      } catch (error) {
        console.error("Erro ao buscar tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [filtro, navigate]);

  // ------------------ FETCH TAGS DOS CLIENTES ------------------
useEffect(() => {
  const loadTags = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    for (const t of tickets) {
      if (!t.cliente_id) continue;
      if (clienteTagsMap[t.cliente_id]) continue;

      try {
        const resp = await fetch(
          `https://backend.sansolenergiasolar.com.br/api/v1/tags/entity/cliente/${t.cliente_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resp.ok) {
          if (resp.status === 401) {
            localStorage.clear();
            navigate("/login");
            return;
          }
          throw new Error("Erro ao buscar tags");
        }

        const tags: Tag[] = await resp.json();

        setClienteTagsMap(prev => ({
          ...prev,
          [t.cliente_id!]: tags,
        }));
      } catch (err) {
        console.error("Erro carregando tags:", err);
      }
    }
  };

  if (tickets.length > 0) {
    loadTags();
  }
}, [tickets, clienteTagsMap]);

  // ------------------ FETCH TAGS DOS TICKETS ------------------
useEffect(() => {
  const loadTicketTags = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    for (const t of tickets) {
      if (ticketTagsMap[t.id]) continue;

      try {
        const resp = await fetch(
          `https://backend.sansolenergiasolar.com.br/api/v1/tags/entity/ticket/${t.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resp.ok) {
          if (resp.status === 401) {
            localStorage.clear();
            navigate("/login");
            return;
          }
          throw new Error("Erro ao buscar tags do ticket");
        }

        const tags: Tag[] = await resp.json();

        setTicketTagsMap(prev => ({
          ...prev,
          [t.id]: tags,
        }));
      } catch (err) {
        console.error("Erro carregando tags do ticket:", err);
      }
    }
  };

  if (tickets.length > 0) {
    loadTicketTags();
  }
}, [tickets, ticketTagsMap]);

  // ------------------ RENDER TAG CHIPS ------------------
  const renderTagChips = (tags: Tag[]) => (
  <div
    style={{
      marginTop: "4px",
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      maxWidth: windowWidth < 640 ? "220px" : "320px",
    }}
  >
    {tags.map((tag) => (
      <TagBadge
        key={tag.id}
        label={tag.name}
        color={tag.color}
        size="sm"
      />
    ))}
  </div>
);

  // ------------------ RENDER COLUNA CLIENTE ------------------
  const renderClienteCell = (row: Ticket) => {
    const tags = row.cliente_id ? clienteTagsMap[row.cliente_id] : null;

    return (
      <div style={{ display: "flex", flexDirection: "column", minWidth: windowWidth < 640 ? "120px" : "150px" }}>
        <span style={{
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {row.cliente}
        </span>
        {tags && tags.length > 0 && renderTagChips(tags)}
      </div>
    );
  };

  // ------------------ RENDER COLUNA TÍTULO (AGORA COM TAGS DO TICKET) ------------------
  const renderTituloCell = (row: Ticket) => {
    const tags = ticketTagsMap[row.id];

    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        minWidth: windowWidth < 640 ? "150px" : "200px"
      }}>
        <span style={{
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {row.titulo}
        </span>
        {tags && tags.length > 0 && renderTagChips(tags)}
      </div>
    );
  };

  // ------------------ RENDER CÉLULA DA TABELA ------------------
  const renderCell = (row: Ticket, column: "ações" | keyof Ticket) => {
    if (column === "cliente") {
      return renderClienteCell(row);
    } else if (column === "titulo") {
      return renderTituloCell(row);
    } else if (column === "ações") {
      // Se o componente Table suporta coluna de ações
      return null; // Ou retorne os botões de ação se necessário
    } else {
      // Para outras colunas, retorna o valor normal
      const value = row[column as Exclude<typeof column, "ações">];
      return (
        <span style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "block"
        }}>
          {value}
        </span>
      );
    }
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      minHeight: "100vh",
      padding: windowWidth < 640 ? "16px" : windowWidth < 1024 ? "20px" : "24px",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
    }}>
      {/* ---------- HEADER ---------- */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: windowWidth < 640 ? "flex-start" : "center",
        flexDirection: windowWidth < 640 ? "column" : "row",
        marginBottom: "32px",
        gap: windowWidth < 640 ? "16px" : "20px"
      }}>
        <div style={{ width: windowWidth < 640 ? "100%" : "auto" }}>
          <h1 style={{
            fontSize: windowWidth < 640 ? "1.5rem" : windowWidth < 1024 ? "1.75rem" : "2rem",
            fontWeight: "700",
            color: "#1e293b",
            margin: "0 0 8px 0",
            background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Gerenciar Tickets
          </h1>
          <p style={{
            color: "#64748b",
            fontSize: windowWidth < 640 ? "0.875rem" : "1rem",
            margin: 0
          }}>
            Gerencie e acompanhe todos os tickets do sistema
          </p>
        </div>

        <div style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          width: windowWidth < 640 ? "100%" : "auto",
          justifyContent: windowWidth < 640 ? "flex-start" : "flex-end"
        }}>
          <Button
            variant="primary"
            onClick={() => setModalNovoTicketOpen(true)}
            style={{
              padding: windowWidth < 640 ? "10px 16px" : "12px 24px",
              fontSize: windowWidth < 640 ? "0.875rem" : "0.95rem",
              width: windowWidth < 640 ? "100%" : "auto"
            }}
          >
            + Novo Ticket
          </Button>
          {modalNovoTicketOpen && <ModalNovoTicket onClose={() => setModalNovoTicketOpen(false)} />}
        </div>
      </div>

      {ticketSelecionado && (
        <ModalTicketMonitoring
          ticket={{
            ...ticketSelecionado,
            descricao: ticketSelecionado.descricao ?? "",
            prioridade: ticketSelecionado.prioridade ?? "media",
            categoria: ticketSelecionado.categoria ?? ""
          }}
          onClose={() => setTicketSelecionado(null)}
          onTicketUpdated={(updatedTicket) => {
            setTickets(prev => prev.map(t => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t)));
            setTicketSelecionado(null);
          }}
        />
      )}

      {/* ---------- FILTROS ---------- */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "24px",
        flexWrap: "wrap",
        background: "#ffffff",
        padding: windowWidth < 640 ? "16px" : "20px",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
        border: "1px solid #f1f5f9"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: windowWidth < 640 ? "wrap" : "nowrap",
          width: windowWidth < 640 ? "100%" : "auto"
        }}>
          <span style={{
            fontWeight: "600",
            color: "#475569",
            fontSize: windowWidth < 640 ? "0.85rem" : "0.9rem",
            marginRight: "8px",
            whiteSpace: "nowrap"
          }}>
            Filtrar por:
          </span>
          <Button
            variant="neutral"
            onClick={() => setFiltro("todos")}
            size={windowWidth < 640 ? "sm" : "md"}
            style={{ flexShrink: 0 }}
          >
            Todos
          </Button>
          <Button
            variant="neutral"
            onClick={() => setFiltro("emAndamento")}
            size={windowWidth < 640 ? "sm" : "md"}
            style={{ flexShrink: 0 }}
          >
            Em Andamento
          </Button>
          <Button
            variant="neutral"
            onClick={() => setFiltro("concluidos")}
            size={windowWidth < 640 ? "sm" : "md"}
            style={{ flexShrink: 0 }}
          >
            Concluídos
          </Button>
        </div>
      </div>

      {/* ---------- TABELA ---------- */}
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: windowWidth < 640 ? "12px" : "0",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
        border: "1px solid #f1f5f9",
        overflow: "hidden",
        maxWidth: "100%"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
            <div style={{ width: "40px", height: "40px", border: "3px solid #f1f5f9", borderTop: "3px solid #ff7a2d", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px auto" }} />
            <p style={{ margin: 0, fontSize: "0.95rem" }}>Carregando tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.5 }}>📭</div>
            <h3 style={{ margin: "0 0 8px 0", color: "#475569", fontSize: "1.25rem" }}>Nenhum ticket encontrado</h3>
            <p style={{ margin: 0, fontSize: "0.95rem" }}>
              {filtro !== "todos" ? "Não há tickets com o filtro selecionado." : "Comece criando seu primeiro ticket."}
            </p>
          </div>
        ) : (
          <div style={{
            overflowX: "auto",
            maxWidth: "100%",
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "-ms-autohiding-scrollbar"
          }}>
            {/* Wrapper para estilizar a tabela */}
            <div style={{
              minWidth: windowWidth < 640 ? "600px" :
                windowWidth < 1024 ? "800px" : "auto",
              fontSize: windowWidth < 640 ? "0.8125rem" : "0.875rem"
            }}>
              <Table
                data={tickets}
                columns={getColumns()}
                page={1}
                pageSize={10}
                onPageChange={() => { }}
                onCellClick={(row) => setTicketSelecionado(row)}
                renderCell={renderCell}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Estilizar a scrollbar para uma melhor aparência */
        ::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Estilos para células da tabela */
        .table-cell {
          padding: ${windowWidth < 640 ? "8px 10px" : "10px 12px"};
          max-width: ${windowWidth < 640 ? "200px" : "250px"};
        }

        .table-header {
          padding: ${windowWidth < 640 ? "12px 10px" : "12px"};
          font-size: ${windowWidth < 640 ? "0.8125rem" : "0.875rem"};
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Tickets;