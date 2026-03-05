import React, { useEffect, useMemo, useState } from "react";
import type { Contrato, ContratoTemplateData } from "../src/types";
import { z } from "zod";
import Button from "./Button";

/**
 * Props
 */
interface ContratoCreateFormProps {
  clienteId?: number;
  onClose: () => void;
  onContratoCriado: (contrato: Contrato) => void;
}

type ContractType = "monitoramento" | "termo_aditivo" | "usina";

const baseUrl = "https://backend.sansolenergiasolar.com.br/api/v1";

const DEFAULT_TEMPLATE_PATHS: Record<ContractType, string> = {
  monitoramento: "app/modules/jornada/templates/monitoramento.docx",
  termo_aditivo: "modules/jornada/templates/termo_aditivo.docx", 
  usina: "modules/jornada/templates/usina.docx",
};

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  monitoramento: "📊 Monitoramento",
  termo_aditivo: "📝 Termo Aditivo",
  usina: "☀️ Usina Fotovoltaica",
};

/**
 * Campo dinâmico
 */
type FieldDef = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "textarea" | "date" | "email";
  cols?: number;
  required?: boolean;
};

const FIELDS_BY_TYPE: Record<ContractType, FieldDef[]> = {
  monitoramento: [
    { name: "template_id", label: "Template ID", placeholder: "Ex: 37", type: "number", cols: 1, required: true },
    { name: "NOME_CONTRATANTE", label: "Nome do Contratante", placeholder: "Ex: Carlos Almeida", required: true },
    { name: "CPF_CNPJ", label: "CPF/CNPJ", placeholder: "000.000.000-00", required: true },
    { name: "ENDERECO_COMPLETO", label: "Endereço completo", placeholder: "Rua X, 123 - Cidade/UF", required: true },
    { name: "PLANO_ESCOLHIDO", label: "Plano escolhido", placeholder: "Ex: OURO", required: true },
    { name: "DATA_ASSINATURA", label: "Data assinatura (DD/MM/AAAA)", placeholder: "18/11/2025", type: "text", required: true },
    { name: "TESTEMUNHA1_NOME", label: "Testemunha 1 - Nome" },
    { name: "TESTEMUNHA1_RG", label: "Testemunha 1 - RG" },
    { name: "TESTEMUNHA2_NOME", label: "Testemunha 2 - Nome" },
    { name: "TESTEMUNHA2_RG", label: "Testemunha 2 - RG" },
  ],

  termo_aditivo: [
    { name: "template_id", label: "Template ID", placeholder: "Ex: 38", type: "number", cols: 1, required: true },
    { name: "NOME_CONTRATANTE", label: "Nome do Contratante", required: true },
    { name: "PLANO_ESCOLHIDO", label: "Plano escolhido", required: true },
    { name: "VALORES_E_CONDICOES", label: "Valores e condições", type: "textarea", required: true },
    { name: "DATA_ASSINATURA", label: "Data assinatura (DD/MM/AAAA)", placeholder: "22/01/2026", required: true },
    { name: "NOME_INTERVENIENTE", label: "Nome Interveniente" },
    { name: "TESTEMUNHA1_NOME", label: "Testemunha 1 - Nome" },
    { name: "TESTEMUNHA1_RG", label: "Testemunha 1 - RG" },
    { name: "TESTEMUNHA2_NOME", label: "Testemunha 2 - Nome" },
    { name: "TESTEMUNHA2_RG", label: "Testemunha 2 - RG" },
  ],

  usina: [
    { name: "template_id", label: "Template ID", placeholder: "Ex: 39", type: "number", cols: 1, required: true },
    { name: "contrato_numero", label: "Número do contrato / proposta", required: true },
    { name: "contratante_nome", label: "Nome do Contratante", required: true },
    { name: "contratante_documento", label: "CPF/CNPJ", required: true },
    { name: "contratante_endereco", label: "Endereço contratante", required: true },
    { name: "contratante_cidade", label: "Cidade", required: true },
    { name: "contratante_estado", label: "Estado (UF)", required: true },
    { name: "contratante_cep", label: "CEP", required: true },
    { name: "quantidade_paineis", label: "Qtd. painéis", type: "number", required: true },
    { name: "modelo_painel", label: "Modelo painel", required: true },
    { name: "quantidade_inversores", label: "Qtd. inversores", type: "number", required: true },
    { name: "modelo_inversor", label: "Modelo inversor", required: true },
    { name: "potencia_nominal_kwp", label: "Potência nominal (kWp)", required: true },
    { name: "valor_total_contrato", label: "Valor total do contrato", required: true },
    { name: "data_compra_equipamentos", label: "Data compra equipamentos", type: "date" },
    { name: "data_termino_instalacao", label: "Data término instalação", type: "date" },
    { name: "nome_interveniente", label: "Nome interveniente" },
    { name: "TESTEMUNHA1_NOME", label: "Testemunha 1 - Nome" },
    { name: "TESTEMUNHA1_RG", label: "Testemunha 1 - RG" },
    { name: "TESTEMUNHA2_NOME", label: "Testemunha 2 - Nome" },
    { name: "TESTEMUNHA2_RG", label: "Testemunha 2 - RG" },
  ],
};

type GenericFormState = Record<string, string> & {
  status?: string;
};

/**
 * Schemas Zod
 */
const monitoramentoSchema = z.object({
  template_id: z.coerce.number().positive("Informe o template_id (número)"),
  NOME_CONTRATANTE: z.string().min(1, "Nome do contratante é obrigatório"),
});

const termoAditivoSchema = z.object({
  ttemplate_id: z.coerce.number().positive("Informe o template_id (número)"),
  NOME_CONTRATANTE: z.string().min(1),
});

const usinaSchema = z.object({
  template_id: z.coerce.number().positive("Informe o template_id (número)"),
  contratante_nome: z.string().min(1),
  valor_total_contrato: z.string().min(1),
});

function isJsonWithUrl(obj: unknown): obj is { url?: string; file_url?: string; download_url?: string } {
  return typeof obj === "object" && obj !== null && ("url" in obj || "file_url" in obj || "download_url" in obj);
}

export const ContratoCreateForm: React.FC<ContratoCreateFormProps> = ({ onClose, onContratoCriado }) => {
  const [selectedType, setSelectedType] = useState<ContractType>("usina");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formState, setFormState] = useState<GenericFormState>({ status: "contrato" });

  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
  }, [selectedType]);

  const fieldDefs = useMemo(() => FIELDS_BY_TYPE[selectedType], [selectedType]);

  const handleChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Build dos dados para o backend
   */
  function buildDados(type: ContractType): ContratoTemplateData {
    const now = new Date();
    const dia = String(now.getDate()).padStart(2, "0");
    const mes = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(now);
    const ano = String(now.getFullYear());

    if (type === "monitoramento") {
      return {
        NOME_CONTRATANTE: formState["NOME_CONTRATANTE"] || "",
        CPF_CNPJ: formState["CPF_CNPJ"] || "",
        ENDERECO_COMPLETO: formState["ENDERECO_COMPLETO"] || "",
        PLANO_ESCOLHIDO: formState["PLANO_ESCOLHIDO"] || "BÁSICO",
        DATA_DIA: dia,
        DATA_MES: mes,
        DATA_ANO: ano,
        TESTEMUNHA1_NOME: formState["TESTEMUNHA1_NOME"] || "",
        TESTEMUNHA1_RG: formState["TESTEMUNHA1_RG"] || "",
        TESTEMUNHA2_NOME: formState["TESTEMUNHA2_NOME"] || "",
        TESTEMUNHA2_RG: formState["TESTEMUNHA2_RG"] || "",
      };
    }

    if (type === "termo_aditivo") {
      const ds = (formState["DATA_ASSINATURA"] || "").split("/");
      return {
        NOME_CONTRATANTE: formState["NOME_CONTRATANTE"] || "",
        PLANO_ESCOLHIDO: formState["PLANO_ESCOLHIDO"] || "",
        VALORES_E_CONDICOES: formState["VALORES_E_CONDICOES"] || "",
        DATA_DIA: ds[0] || dia,
        DATA_MES: ds[1] || mes,
        DATA_ANO: ds[2] || ano,
        NOME_INTERVENIENTE: formState["NOME_INTERVENIENTE"] || "",
        TESTEMUNHA1_NOME: formState["TESTEMUNHA1_NOME"] || "",
        TESTEMUNHA1_RG: formState["TESTEMUNHA1_RG"] || "",
        TESTEMUNHA2_NOME: formState["TESTEMUNHA2_NOME"] || "",
        TESTEMUNHA2_RG: formState["TESTEMUNHA2_RG"] || "",
      };
    }

    if (type === "usina") {
      return {
        contrato_numero: formState["contrato_numero"] || "",
        contratante_nome: formState["contratante_nome"] || "",
        contratante_tipo: "física",
        contratante_documento: formState["contratante_documento"] || "",
        contratante_endereco: formState["contratante_endereco"] || "",
        contratante_cidade: formState["contratante_cidade"] || "",
        contratante_estado: formState["contratante_estado"] || "",
        contratante_cep: formState["contratante_cep"] || "",
        contratante_representante: formState["contratante_representante"] || formState["contratante_nome"] || "",
        quantidade_paineis: formState["quantidade_paineis"] || "",
        modelo_painel: formState["modelo_painel"] || "",
        quantidade_inversores: formState["quantidade_inversores"] || "",
        modelo_inversor: formState["modelo_inversor"] || "",
        potencia_nominal_kwp: formState["potencia_nominal_kwp"] || "",
        endereco_unidade_consumidora: formState["endereco_unidade_consumidora"] || "",
        descricao_alteracao_projeto: formState["descricao_alteracao_projeto"] || "Nenhuma alteração prevista",
        nome_distribuidora: formState["nome_distribuidora"] || "",
        valor_total_contrato: formState["valor_total_contrato"] || "",
        nome_fabricante: formState["nome_fabricante"] || "",
        data_compra_equipamentos: formState["data_compra_equipamentos"] || "",
        nome_interveniente: formState["nome_interveniente"] || "",
        data_termino_instalacao: formState["data_termino_instalacao"] || "",
        link_tabela_preco: formState["link_tabela_preco"] || "",
        tabela_preco_anexa_sim_nao: formState["tabela_preco_anexa_sim_nao"] || "",
        endereco_instalacao: formState["endereco_instalacao"] || "",
        nome_fabricante_inversor: formState["nome_fabricante_inversor"] || "",
        dados_rede_novos_opcional: formState["dados_rede_novos_opcional"] || "",
        fornecedor_equipamentos: formState["fornecedor_equipamentos"] || "",
        numero_proposta: formState["numero_proposta"] || "",
        sistema_fotovoltaico: formState["sistema_fotovoltaico"] || "",
        fabricante_modulos: formState["fabricante_modulos"] || "",
        distribuidora: formState["distribuidora"] || "",
        documento_contratante: formState["documento_contratante"] || "",
        data_assinatura: formState["data_assinatura"] || "",
        TESTEMUNHA1_NOME: formState["TESTEMUNHA1_NOME"] || "",
        TESTEMUNHA1_RG: formState["TESTEMUNHA1_RG"] || "",
        TESTEMUNHA2_NOME: formState["TESTEMUNHA2_NOME"] || "",
        TESTEMUNHA2_RG: formState["TESTEMUNHA2_RG"] || "",
      };
    }

    return {};
  }

  async function callGenerateEndpoint(type: ContractType, template_id: number, dados: ContratoTemplateData) {
    const endpointMap: Record<ContractType, string> = {
      monitoramento: `${baseUrl}/contratostemplates/gerar-monitoramento`,
      termo_aditivo: `${baseUrl}/contratostemplates/gerar-termo-aditivo`,
      usina: `${baseUrl}/contratostemplates/gerar-usina`,
    };

    const url = endpointMap[type];
    const body = { template_id, dados };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Falha ao gerar contrato: ${resp.status} ${txt}`);
    }

    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await resp.json();
      if (isJsonWithUrl(json)) {
        const url = json.url ?? json.file_url ?? json.download_url;
        return { url, rawJson: json } as const;
      }
      return { json } as const;
    }

    const blob = await resp.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    return { downloadUrl, blob } as const;
  }

  const validateForType = (type: ContractType) => {
    setError(null);
    try {
      const dataToValidate: Record<string, unknown> = {};
      FIELDS_BY_TYPE[type].forEach((f) => {
        dataToValidate[f.name] = formState[f.name];
      });

      if (type === "monitoramento") monitoramentoSchema.parse(dataToValidate);
      else if (type === "termo_aditivo") termoAditivoSchema.parse(dataToValidate);
      else if (type === "usina") usinaSchema.parse(dataToValidate);

      return null;
    } catch (err) {
      if (err instanceof z.ZodError) {
        return err.errors.map((e) => e.message).join("; ");
      }
      return "Erro desconhecido";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const validationError = validateForType(selectedType);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const templateId = Number(formState["template_id"]);
      if (!templateId || Number.isNaN(templateId)) {
        throw new Error("Informe um template_id válido (número) antes de gerar.");
      }

      const dados = buildDados(selectedType);
      const result = await callGenerateEndpoint(selectedType, templateId, dados);

      if ("url" in result && result.url) {
        window.open(result.url, "_blank");
        setSuccessMsg("Contrato gerado com sucesso (link recebido).");
      } else if ("downloadUrl" in result && result.downloadUrl) {
        const a = document.createElement("a");
        a.href = result.downloadUrl;
        a.download = `${selectedType}_${Date.now()}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setSuccessMsg("Contrato gerado e baixado com sucesso.");
      } else if ("json" in result && result.json) {
        const json = result.json;

        if (typeof json === "object" && json !== null && "id" in json) {
          onContratoCriado(json as Contrato);
        } else {
          onContratoCriado({
            id: Date.now(),
            inversor_modelo: String(formState["modelo_inversor"] || ""),
            inversor_potencia_w: Number(formState["potencia_nominal_kwp"] || 0),
            inversor_quantidade: Number(formState["quantidade_inversores"] || 0),
            placa_modelo: String(formState["modelo_painel"] || ""),
            placa_potencia_w: 0,
            placa_quantidade: Number(formState["quantidade_paineis"] || 0),
            status: formState.status || "contrato",
            dt_venda: formState["data_compra_equipamentos"] || "",
          });
        }

        setSuccessMsg("Contrato criado (resposta JSON).");
      }

      setTimeout(() => onClose(), 700);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFillExample = () => {
    if (selectedType === "monitoramento") {
      setFormState((s) => ({
        ...s,
        template_id: "37",
        NOME_CONTRATANTE: "Carlos Almeida",
        CPF_CNPJ: "123.456.789-00",
        ENDERECO_COMPLETO: "Av. Paulista, 1000 - São Paulo/SP",
        PLANO_ESCOLHIDO: "OURO",
        DATA_ASSINATURA: "18/11/2025",
      }));
    } else if (selectedType === "usina") {
      setFormState((s) => ({
        ...s,
        template_id: "39",
        contratante_nome: "João da Silva",
        valor_total_contrato: "R$ 50.000,00",
        quantidade_paineis: "20",
        modelo_painel: "F550",
        quantidade_inversores: "2",
        modelo_inversor: "IG5000",
        potencia_nominal_kwp: "7.5",
      }));
    } else if (selectedType === "termo_aditivo") {
      setFormState((s) => ({
        ...s,
        template_id: "38",
        NOME_CONTRATANTE: "Maria Santos",
        PLANO_ESCOLHIDO: "PLATINUM",
        VALORES_E_CONDICOES: "Acréscimo de 10 painéis solares ao sistema existente",
        DATA_ASSINATURA: "22/01/2026",
      }));
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h2 style={styles.title}>Gerar Contrato</h2>
            <p style={styles.subtitle}>Selecione o tipo de contrato e preencha os campos obrigatórios</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <span style={styles.closeIcon}>×</span>
          </button>
        </div>

        {/* Conteúdo principal */}
        <div style={styles.content}>
          {/* Coluna esquerda - Tipo de Contrato e Informações */}
          <div style={styles.leftColumn}>
            {/* Tipo de Contrato */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>📄</span>
                <h4 style={styles.sectionTitle}>Tipo de Contrato</h4>
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ContractType)}
                style={styles.select}
              >
                {(Object.entries(CONTRACT_TYPE_LABELS) as [ContractType, string][]).map(([type, label]) => (
                  <option key={type} value={type}>{label}</option>
                ))}
              </select>
            </div>

            {/* Informações do Template */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>🔧</span>
                <h4 style={styles.sectionTitle}>Configuração do Template</h4>
              </div>
              <div style={styles.templateInfo}>
                <div style={styles.templatePath}>
                  <strong>Template padrão:</strong> {DEFAULT_TEMPLATE_PATHS[selectedType]}
                </div>
                <div style={styles.templateHint}>
                  Altere o <strong>template_id</strong> acima após criar o template na API
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>⚡</span>
                <h4 style={styles.sectionTitle}>Ações Rápidas</h4>
              </div>
              <div style={styles.actionsGrid}>
                <Button 
                  variant="secondary" 
                  onClick={handleFillExample}
                  size="sm"
                  icon={false}
                  style={styles.actionBtn}
                >
                  Preencher Exemplo
                </Button>
                <Button 
                  variant="neutral"
                  onClick={() => {
                    alert(
                      `Use os endpoints:\nPOST /contratostemplates/templates (criar)\nPOST /contratostemplates/gerar-${selectedType}`
                    );
                  }}
                  size="sm"
                  icon={false}
                  style={styles.actionBtn}
                >
                  Ajuda Endpoints
                </Button>
              </div>
            </div>

            {/* Observações */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Observações (opcional)</label>
              <textarea
                value={formState["observacoes"] || ""}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                style={styles.textarea}
                rows={5}
                placeholder="Adicione observações relevantes sobre este contrato..."
              />
              <div style={styles.charCount}>
                {formState["observacoes"]?.length || 0}/500 caracteres
              </div>
            </div>
          </div>

          {/* Coluna direita - Campos Dinâmicos */}
          <div style={styles.rightColumn}>
            <div style={styles.fieldsContainer}>
              {fieldDefs.map((def) => (
                <div key={def.name} style={styles.fieldGroup}>
                  <label style={styles.label}>
                    {def.label}
                    {def.required && <span style={styles.requiredStar}> *</span>}
                  </label>
                  {def.type === "textarea" ? (
                    <textarea
                      value={String(formState[def.name] ?? "")}
                      onChange={(e) => handleChange(def.name, e.target.value)}
                      placeholder={def.placeholder || ""}
                      style={styles.textarea}
                      rows={4}
                    />
                  ) : (
                    <input
                      type={def.type || "text"}
                      value={String(formState[def.name] ?? "")}
                      onChange={(e) => handleChange(def.name, e.target.value)}
                      placeholder={def.placeholder || ""}
                      style={styles.input}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mensagens de Status */}
        {(error || successMsg || loading) && (
          <div style={styles.messagesContainer}>
            {error && (
              <div style={styles.errorMessage}>
                <span style={styles.messageIcon}>⚠️</span>
                {error}
              </div>
            )}
            {successMsg && (
              <div style={styles.successMessage}>
                <span style={styles.messageIcon}>✅</span>
                {successMsg}
              </div>
            )}
            {loading && (
              <div style={styles.loadingMessage}>
                <span style={styles.messageIcon}>⏳</span>
                Processando contrato...
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerInfo}>
              {CONTRACT_TYPE_LABELS[selectedType]} • {fieldDefs.length} campos
            </div>
            <div style={styles.footerActions}>
              <Button 
                variant="neutral" 
                onClick={onClose}
                style={styles.cancelBtn}
              >
                Cancelar
              </Button>
              <Button 
                variant="save"
                onClick={handleSubmit}
                disabled={loading}
                style={styles.saveBtn}
              >
                {loading ? "Gerando..." : "Gerar Contrato"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === ESTILOS COM MODAL MAIOR ===
const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
    // ⬇️ REMOVA o padding para dar mais espaço ao modal
  },
  modal: {
  backgroundColor: "#fff",
  borderRadius: "16px",
  width: "98vw", // ⬅️ Quase toda a largura da tela
  height: "98vh", // ⬅️ Quase toda a altura da tela
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  overflow: "hidden",
  border: "1px solid #e1e5e9",
  maxWidth: "1600px", // ⬅️ Largura máxima bem grande
  maxHeight: "1000px", // ⬅️ Altura máxima bem grande
},
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "28px 28px 20px 28px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e1e5e9",
    flexShrink: 0,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: "26px",
    margin: "0 0 6px 0",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "15px",
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "28px",
    cursor: "pointer",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    transition: "all 0.2s ease",
  },
  closeIcon: {
    lineHeight: 1,
  },
  content: {
    display: "flex",
    gap: "32px",
    padding: "28px",
    overflow: "hidden",
    flex: 1,
    minHeight: 0,
  },
  leftColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    minWidth: "350px",
    overflow: "auto",
  },
  rightColumn: {
    flex: 2.5,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  fieldsContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    overflowY: "auto",
    paddingRight: "12px",
    maxHeight: "100%",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  section: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e1e5e9",
    borderRadius: "12px",
    padding: "20px",
    transition: "all 0.2s ease",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
  },
  sectionIcon: {
    fontSize: "18px",
  },
  sectionTitle: {
    margin: 0,
    fontWeight: "600",
    color: "#374151",
    fontSize: "15px",
  },
  templateInfo: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.5",
  },
  templatePath: {
    marginBottom: "10px",
  },
  templateHint: {
    fontSize: "13px",
    color: "#9ca3af",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  actionBtn: {
    width: "100%",
    justifyContent: "center",
    padding: "10px 12px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontWeight: "600",
    color: "#374151",
    fontSize: "15px",
    marginBottom: "6px",
  },
  requiredStar: {
    color: "#ef4444",
  },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    transition: "all 0.2s ease",
    backgroundColor: "#fff",
    minHeight: "48px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    backgroundColor: "#fff",
    minHeight: "100px",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    backgroundColor: "#fff",
    transition: "all 0.2s ease",
    cursor: "pointer",
    minHeight: "48px",
  },
  charCount: {
    fontSize: "13px",
    color: "#6b7280",
    textAlign: "right",
    marginTop: "6px",
  },
  messagesContainer: {
    padding: "0 28px 16px 28px",
    marginBottom: "0",
    flexShrink: 0,
  },
  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 18px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "15px",
    fontWeight: "500",
  },
  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 18px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    color: "#16a34a",
    fontSize: "15px",
    fontWeight: "500",
  },
  loadingMessage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 18px",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    color: "#2563eb",
    fontSize: "15px",
    fontWeight: "500",
  },
  messageIcon: {
    fontSize: "18px",
  },
  footer: {
    padding: "20px 28px 28px 28px",
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e1e5e9",
    flexShrink: 0,
  },
  footerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerInfo: {
    fontSize: "15px",
    color: "#64748b",
    fontWeight: "500",
  },
  footerActions: {
    display: "flex",
    gap: "14px",
  },
  cancelBtn: {
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "15px",
  },
  saveBtn: {
    padding: "12px 28px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "15px",
  },
};

export default ContratoCreateForm;