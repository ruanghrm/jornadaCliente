// components/TabGeral.tsx
import React from "react";
import Button from "../Button";
import type { Ticket } from "../../src/types";

interface TabGeralProps {
  ticket: Ticket; // Agora usando a interface importada
  status: string;
  setStatus: (status: string) => void;
  prioridade: string;
  setPrioridade: (prioridade: string) => void;
  categoria: string;
  setCategoria: (categoria: string) => void;
  descricao: string;
  setDescricao: (descricao: string) => void;
  loading: boolean;
  onAtualizar: () => void;
  onClaim: () => void;
  onFechar: () => void;
}

const TabGeral: React.FC<TabGeralProps> = ({
  ticket,
  status,
  setStatus,
  prioridade,
  setPrioridade,
  categoria,
  setCategoria,
  descricao,
  setDescricao,
  loading,
  onAtualizar,
  onClaim,
  onFechar,
}) => {
  return (
    <div>
      {/* Informações do Ticket */}
      <div style={{
        background: "#f8fafc",
        padding: "16px",
        borderRadius: "12px",
        marginBottom: "24px",
        border: "1px solid #e2e8f0"
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Cliente</label>
            <p style={{ margin: "4px 0 0 0", color: "#1e293b", fontWeight: "500" }}>
              {ticket.cliente || "Não informado"}
            </p>
          </div>
          <div>
            <label style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Usina</label>
            <p style={{ margin: "4px 0 0 0", color: "#1e293b", fontWeight: "500" }}>
              {ticket.usina || "Não informada"}
            </p>
          </div>
          <div>
            <label style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Data de Criação</label>
            <p style={{ margin: "4px 0 0 0", color: "#1e293b", fontWeight: "500" }}>
              {ticket.criacao || "Não informada"}
            </p>
          </div>
          <div>
            <label style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Prazo</label>
            <p style={{ margin: "4px 0 0 0", color: "#1e293b", fontWeight: "500" }}>
              {ticket.prazo || "Não definido"}
            </p>
          </div>
        </div>
      </div>

      {/* Campos editáveis */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
        {/* Status */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{
            fontWeight: "600",
            fontSize: "0.85rem",
            marginBottom: "8px",
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "0.95rem",
              background: "#ffffff",
              color: "#1e293b",
              cursor: "pointer"
            }}
          >
            <option value="aberto">Aberto</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="fechado">Fechado</option>
            <option value="pendente">Pendente</option>
          </select>
        </div>

        {/* Prioridade */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{
            fontWeight: "600",
            fontSize: "0.85rem",
            marginBottom: "8px",
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>Prioridade</label>
          <select
            value={prioridade}
            onChange={e => setPrioridade(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "0.95rem",
              background: "#ffffff",
              color: "#1e293b"
            }}
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        {/* Categoria */}
        <div style={{ display: "flex", flexDirection: "column", gridColumn: "span 2" }}>
          <label style={{
            fontWeight: "600",
            fontSize: "0.85rem",
            marginBottom: "8px",
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>Categoria</label>
          <input
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            placeholder="Digite a categoria do ticket"
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "0.95rem",
              background: "#ffffff",
              color: "#1e293b"
            }}
          />
        </div>

        {/* Descrição */}
        <div style={{ display: "flex", flexDirection: "column", gridColumn: "span 2" }}>
          <label style={{
            fontWeight: "600",
            fontSize: "0.85rem",
            marginBottom: "8px",
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>Descrição</label>
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Digite a descrição do ticket"
            rows={4}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              width: "100%",
              resize: "vertical"
            }}
          />
        </div>
      </div>

      {/* Botões de Ação */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
        <Button variant="save" onClick={onAtualizar} disabled={loading} style={{ flex: "1" }}>
          {loading ? "Atualizando..." : "Salvar Alterações"}
        </Button>
        <Button variant="edit" onClick={onClaim} disabled={loading}>
          Assumir Ticket
        </Button>
        <Button variant="close" onClick={onFechar} disabled={loading}>
          Fechar Ticket
        </Button>
      </div>
    </div>
  );
};

export default TabGeral;