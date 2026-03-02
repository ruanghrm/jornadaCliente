import React, { useState } from "react";
import Button from "./Button";
import type { Contrato } from "../src/types";

interface ContratoFormProps {
  contratoData: Record<string, string | number>;
  setContratoData: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
  contratoId: number;
  onContratoAtualizado?: (contrato: Contrato) => void;
}

export const ContratoForm: React.FC<ContratoFormProps> = ({
  contratoData,
  setContratoData,
  contratoId,
  onContratoAtualizado,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://backend.sansolenergiasolar.com.br/api/v1/contratos/${contratoId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contratoData),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao atualizar contrato: ${response.statusText}`);
      }

      const contratoAtualizado: Contrato = await response.json();
      if (onContratoAtualizado) {
        onContratoAtualizado(contratoAtualizado);
      }
      alert("Contrato atualizado com sucesso!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Função melhorada para formatar os nomes dos campos
  const formatLabel = (key: string): string => {
    const formatMap: Record<string, string> = {
      // Campos de data
      'dt_ligacao': 'Data de Ligação',
      'dt_pagamento': 'Data de Pagamento',
      'dt_venda': 'Data de Venda',
      'dt_instalacao': 'Data de Instalação',
      'data_ultima_atualizacao': 'Data da Última Atualização',
      'dt_vencimento': 'Data de Vencimento',
      'dt_assinatura': 'Data de Assinatura',
      'dt_criacao': 'Data de Criação',
      
      // Campos comuns
      'valor_total': 'Valor Total',
      'valor_entrada': 'Valor de Entrada',
      'valor_parcela': 'Valor da Parcela',
      'qtd_parcelas': 'Quantidade de Parcelas',
      'status': 'Status',
      'numero_contrato': 'Número do Contrato',
      'cliente_id': 'ID do Cliente',
      'vendedor': 'Vendedor',
      'instalador': 'Instalador',
      'tipo_contrato': 'Tipo de Contrato',
      'observacoes': 'Observações',
      'forma_pagamento': 'Forma de Pagamento',
      'potencia_sistema': 'Potência do Sistema',
      'endereco_instalacao': 'Endereço de Instalação',
    };

    // Se existe um mapeamento específico, usa ele
    if (formatMap[key.toLowerCase()]) {
      return formatMap[key.toLowerCase()];
    }

    // Caso contrário, formata automaticamente
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/\bDt\b/g, 'Data')
      .replace(/\bQtd\b/g, 'Quantidade')
      .replace(/\bId\b/g, 'ID')
      .replace(/\bCep\b/g, 'CEP')
      .replace(/\bCpf\b/g, 'CPF')
      .replace(/\bCnpj\b/g, 'CNPJ');
  };

  // Função para determinar o tipo de input baseado no nome do campo
  const getInputType = (key: string, value: string | number): string => {
    const keyLower = key.toLowerCase();
    
    if (keyLower.includes('data') || keyLower.includes('dt_')) {
      return 'date';
    }
    
    if (typeof value === 'number') {
      return 'number';
    }
    
    if (keyLower.includes('email')) {
      return 'email';
    }
    
    if (keyLower.includes('telefone') || keyLower.includes('celular') || keyLower.includes('phone')) {
      return 'tel';
    }
    
    return 'text';
  };

  // Função para formatar o valor para exibição
  const formatValue = (key: string, value: string | number): string => {
    if (getInputType(key, value) === 'date' && value) {
      // Se for uma data e tiver valor, formata para o formato do input date (YYYY-MM-DD)
      if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    return String(value);
  };

  // Função para processar o valor ao alterar
  const processValue = (key: string, value: string): string | number => {
    const originalValue = contratoData[key];
    
    if (getInputType(key, originalValue) === 'date') {
      return value; // Mantém como string no formato YYYY-MM-DD
    }
    
    if (typeof originalValue === 'number') {
      return value === '' ? 0 : Number(value);
    }
    
    return value;
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        padding: "28px",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        border: "1px solid #f1f5f9",
        marginTop: "24px",
      }}
    >
      <h3
        style={{
          margin: "0 0 24px 0",
          color: "#1e293b",
          fontSize: "1.25rem",
          fontWeight: "600",
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}
      >
        Editar Contrato
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        {Object.keys(contratoData).map((key) => (
          <div key={key} style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontWeight: "600",
                fontSize: "0.85rem",
                marginBottom: "8px",
                color: "#475569",
                letterSpacing: "0.3px",
              }}
            >
              {formatLabel(key)}
            </label>
            <input
              type={getInputType(key, contratoData[key])}
              value={formatValue(key, contratoData[key])}
              onChange={(e) =>
                setContratoData((prev) => ({
                  ...prev,
                  [key]: processValue(key, e.target.value),
                }))
              }
              placeholder={`Informe ${formatLabel(key).toLowerCase()}`}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                fontSize: "0.95rem",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "#ffffff",
                color: "#1e293b",
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                e.target.style.background = "#ffffff";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid #e2e8f0";
                e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.04)";
                e.target.style.background = "#ffffff";
              }}
            />
          </div>
        ))}
      </div>

      {error && (
        <div
          style={{
            background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
            color: "#dc2626",
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
            border: "1px solid #fca5a5",
            fontSize: "0.9rem",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}>⚠️</span>
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingTop: "16px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <Button
          variant="save"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "12px 32px",
            fontSize: "0.95rem",
            minWidth: "160px",
          }}
        >
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid transparent",
                  borderTop: "2px solid currentColor",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              Atualizando...
            </div>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};