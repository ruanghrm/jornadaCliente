import React from "react";
import Button from "./Button";
import type { Contrato } from "../src/types";

interface ContratoDropdownProps {
  clienteId: number;
  contratos: Contrato[];
  selectedContrato: number | "";
  onSelect: (id: number) => void;
  onContratoDeletado: (contratoId: number) => void;
}

export const ContratoDropdown: React.FC<ContratoDropdownProps> = ({
  contratos,
  selectedContrato,
  onSelect,
  onContratoDeletado,
}) => {
  const handleDelete = async () => {
    if (!selectedContrato) return;

    const confirm = window.confirm("Tem certeza que deseja deletar este contrato?");
    if (!confirm) return;

    try {
      const response = await fetch(`https://backend.sansolenergiasolar.com.br/api/v1/contratos/${selectedContrato}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao deletar contrato");
      }

      alert("Contrato excluído com sucesso");
      onContratoDeletado(selectedContrato);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Erro: ${err.message}`);
      } else {
        alert("Erro desconhecido ao deletar contrato");
      }
    }
  };

  // Função para formatar o texto do contrato
  const formatContratoText = (contrato: Contrato): string => {
    const parts = [];
    if (contrato.inversor_modelo) parts.push(contrato.inversor_modelo);
    if (contrato.placa_modelo) parts.push(contrato.placa_modelo);
    if (contrato.status) parts.push(contrato.status);
    
    return parts.length > 0 ? parts.join(" / ") : `Contrato #${contrato.id}`;
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
        border: "1px solid #f1f5f9",
        marginTop: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "20px",
              background: "linear-gradient(135deg, #ff7a2d 0%, #ff5722 100%)",
              borderRadius: "2px",
            }}
          />
          <label
            style={{
              fontWeight: "600",
              fontSize: "1.1rem",
              color: "#1e293b",
              fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            }}
          >
            Contratos do Cliente
          </label>
          <span
            style={{
              background: "linear-gradient(135deg, #ff7a2d 0%, #ff5722 100%)",
              color: "#ffffff",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "600",
            }}
          >
            {contratos.length}
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <select
            value={selectedContrato}
            onChange={(e) => onSelect(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "14px 48px 14px 16px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "0.95rem",
              fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
              background: "#ffffff",
              color: "#1e293b",
              cursor: "pointer",
              appearance: "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px center",
              backgroundSize: "16px",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid #3b82f6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid #e2e8f0";
              e.target.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.04)";
            }}
          >
            <option value="">Selecione um contrato para editar</option>
            {contratos.map((c) => (
              <option key={c.id} value={c.id}>
                {formatContratoText(c)}
              </option>
            ))}
          </select>
        </div>

        {selectedContrato && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f9",
              marginTop: "8px",
            }}
          >
            <Button
              variant="delete"
              onClick={handleDelete}
              style={{
                padding: "10px 24px",
                fontSize: "0.9rem",
              }}
            >
              Excluir Contrato Selecionado
            </Button>
          </div>
        )}
      </div>

      {contratos.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "32px 20px",
            color: "#64748b",
            fontSize: "0.95rem",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.5 }}>📄</div>
          Nenhum contrato encontrado para este cliente
        </div>
      )}
    </div>
  );
};