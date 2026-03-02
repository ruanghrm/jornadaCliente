import React from "react";
import { ContratoDropdown } from "../ContratosDropDown";
import { ContratoForm } from "../ContratoForm";
import { ContratoCreateForm } from "../ContratoCreateForm";
import type { ContratosSectionProps } from "./types";
import type { Contrato } from "../../src/types";

export const ContratosTab: React.FC<ContratosSectionProps> = ({
  cliente,
  contratos,
  loadingContratos,
  errorContratos,
  selectedContratoId,
  contratoData,
  criandoContrato,
  onSelectContrato,
  onContratoDataChange,
  onCriarContrato,
  onContratoCriado,
  onContratoAtualizado,
  onContratoDeletado
}) => {
  return (
    <div style={{
      minHeight: "calc(85vh - 250px)",
      display: "flex",
      flexDirection: "column"
    }}>
      {criandoContrato ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <ContratoCreateForm
            clienteId={cliente.id}
            onClose={() => onCriarContrato(false)}
            onContratoCriado={(contrato: Contrato) => {
              onContratoCriado(contrato);
              onCriarContrato(false);
            }}
          />
        </div>
      ) : (
        <>
          {/* CABEÇALHO COM BOTÃO DE CRIAR CONTRATO */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "1px solid #e5e7eb"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1f2937",
              margin: 0
            }}>
              Contratos do Cliente
            </h3>
            <button
              onClick={() => onCriarContrato(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#FF7A2D",
                color: "#ffffff",
                border: "none",
                padding: "12px 20px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#FF6B00"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#FF7A2D"}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Criar Novo Contrato
            </button>
          </div>

          {/* CONTEÚDO DOS CONTRATOS */}
          <div style={{ flex: 1 }}>
            {loadingContratos && (
              <div style={{
                textAlign: "center",
                padding: "60px 40px",
                color: "#6b7280"
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid #f3f4f6",
                  borderTopColor: "#FF7A2D",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 16px"
                }} />
                Carregando contratos...
              </div>
            )}

            {errorContratos && (
              <div style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid #fecaca",
                fontSize: "14px",
                marginBottom: "20px"
              }}>
                {errorContratos}
              </div>
            )}

            {!loadingContratos && contratos.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <ContratoDropdown
                  clienteId={cliente.id}
                  contratos={contratos || []}
                  selectedContrato={selectedContratoId}
                  onSelect={onSelectContrato}
                  onContratoDeletado={onContratoDeletado}
                />
              </div>
            )}

            {Object.keys(contratoData).length > 0 && (
              <div>
                <ContratoForm
                  contratoData={contratoData}
                  setContratoData={onContratoDataChange}
                  contratoId={selectedContratoId as number}
                  onContratoAtualizado={onContratoAtualizado}
                />
              </div>
            )}

            {!loadingContratos && contratos.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "60px 40px",
                background: "#f9fafb",
                borderRadius: "12px",
                border: "1px dashed #d1d5db",
                marginTop: "40px"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px", color: "#9ca3af" }}>
                  📝
                </div>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#6b7280",
                  margin: "0 0 8px 0"
                }}>
                  Nenhum contrato encontrado
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "#9ca3af",
                  margin: "0 0 20px 0",
                  maxWidth: "400px",
                  marginLeft: "auto",
                  marginRight: "auto"
                }}>
                  Crie o primeiro contrato para este cliente clicando no botão acima.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};