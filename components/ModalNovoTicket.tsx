import React, { useState, useEffect } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

interface ModalNovoTicketProps {
  onClose: () => void;
  clienteIdPreSelecionado?: number | null;
  openedByUserId?: number;
}

interface Cliente {
  id: number;
  nome_completo: string;
}

interface Contrato {
  id: number;
  inversor_modelo: string;
  inversor_potencia_w: number;
  inversor_quantidade: number;
  placa_modelo?: string;
  status?: string;
}

const ModalNovoTicket: React.FC<ModalNovoTicketProps> = ({ onClose, openedByUserId }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);

  const [clienteId, setClienteId] = useState<number | null>(null);
  const [contratoId, setContratoId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState("aberto");
  const [prioridade, setPrioridade] = useState("media");
  const [categoria, setCategoria] = useState("suporte");
  const [assignedUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  // === GET CLIENTES ===
useEffect(() => {
  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "https://backend.sansolenergiasolar.com.br/api/v1/jclientes/",
        {
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
        throw new Error("Erro ao carregar clientes");
      }

      const data = await response.json();
      setClientes(data.results || data);
    } catch (err) {
      console.error(err);
      alert("Não foi possível carregar a lista de clientes.");
    }
  };

  fetchClientes();
}, []);

// === GET CONTRATOS com base no cliente selecionado ===
useEffect(() => {
  if (!clienteId) return;

  const fetchContratos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `https://backend.sansolenergiasolar.com.br/api/v1/contratos/cliente/${clienteId}`,
        {
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
        throw new Error("Erro ao carregar contratos");
      }

      const data = await response.json();
      setContratos(data.results || data);
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar contratos para este cliente.");
    }
  };

  fetchContratos();
}, [clienteId]);

// === SALVAR TICKET ===
const salvarTicket = async () => {
  if (!titulo || !descricao || !clienteId) {
    alert("Preencha o título, a descrição e selecione o cliente.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    navigate("/login");
    return;
  }

  const novoTicket = {
    cliente_id: clienteId,
    contrato_id: contratoId,
    titulo,
    descricao,
    status,
    prioridade,
    categoria,
    assigned_user_id: assignedUserId,
    opened_by_user_id: openedByUserId,
    opened_by_cliente_id: null,
  };

  try {
    const response = await fetch(
      "https://backend.sansolenergiasolar.com.br/api/v1/tickets/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novoTicket),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      throw new Error("Erro ao criar ticket");
    }

    alert("✅ Ticket criado com sucesso!");
    onClose();
  } catch (err) {
    console.error(err);
    alert("❌ Erro ao salvar ticket. Verifique os campos e tente novamente.");
  }
};

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h2 style={styles.title}>Novo Ticket</h2>
            <p style={styles.subtitle}>Preencha as informações para criar um novo ticket</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <span style={styles.closeIcon}>×</span>
          </button>
        </div>

        {/* Conteúdo principal */}
        <div style={styles.content}>
          {/* Coluna esquerda */}
          <div style={styles.leftColumn}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Título do Ticket</label>
              <input
                type="text"
                placeholder="Digite um título claro e objetivo..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                style={styles.input}
              />
              <div style={styles.timestamp}>
                <span style={styles.timestampIcon}>🕒</span>
                Último ticket criado em {new Date().toLocaleDateString("pt-BR")} às{" "}
                {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Descrição Detalhada</label>
              <textarea
                placeholder="Descreva o problema ou solicitação com o máximo de detalhes possível..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                style={styles.textarea}
                rows={5}
              />
              <div style={styles.charCount}>
                {descricao.length}/500 caracteres
              </div>
            </div>
          </div>

          {/* Coluna direita */}
          <div style={styles.rightColumn}>
            {/* Cliente */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>👤</span>
                <h4 style={styles.sectionTitle}>Cliente</h4>
              </div>
              <select
                value={clienteId ?? ""}
                onChange={(e) => setClienteId(Number(e.target.value))}
                style={styles.select}
              >
                <option value="">Selecione o cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome_completo}</option>
                ))}
              </select>
            </div>

            {/* Contrato */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>📄</span>
                <h4 style={styles.sectionTitle}>Contrato</h4>
              </div>
              <select
                value={contratoId ?? ""}
                onChange={(e) => setContratoId(Number(e.target.value))}
                style={{
                  ...styles.select,
                  ...(!clienteId ? styles.disabledSelect : {})
                }}
                disabled={!clienteId}
              >
                <option value="">{clienteId ? "Selecione o contrato" : "Selecione um cliente primeiro"}</option>
                {contratos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.inversor_modelo} - {c.inversor_potencia_w}W
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>📊</span>
                <h4 style={styles.sectionTitle}>Status</h4>
              </div>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                style={styles.select}
              >
                <option value="aberto">🟡 Aberto</option>
                <option value="em_andamento">🔵 Em andamento</option>
                <option value="concluido">🟢 Concluído</option>
              </select>
            </div>

            {/* Prioridade */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>⚡</span>
                <h4 style={styles.sectionTitle}>Prioridade</h4>
              </div>
              <select 
                value={prioridade} 
                onChange={(e) => setPrioridade(e.target.value)} 
                style={{
                  ...styles.select,
                  ...(prioridade === "alta" ? styles.highPriority : 
                       prioridade === "media" ? styles.mediumPriority : 
                       styles.lowPriority)
                }}
              >
                <option value="baixa">🟢 Baixa</option>
                <option value="media">🟡 Média</option>
                <option value="alta">🔴 Alta</option>
              </select>
            </div>

            {/* Categoria */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>📁</span>
                <h4 style={styles.sectionTitle}>Categoria</h4>
              </div>
              <select 
                value={categoria} 
                onChange={(e) => setCategoria(e.target.value)} 
                style={styles.select}
              >
                <option value="suporte">🔧 Suporte</option>
                <option value="instalacao">⚡ Instalação</option>
                <option value="financeiro">💰 Financeiro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerContent}>
            <Button 
              variant="neutral" 
              onClick={onClose}
              style={styles.cancelBtn}
            >
              Cancelar
            </Button>
            <Button 
              onClick={salvarTicket}
              style={styles.saveBtn}
            >
              Criar Ticket
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// === ESTILOS ATUALIZADOS ===
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
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "950px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    overflow: "hidden",
    border: "1px solid #e1e5e9",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px 24px 16px 24px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e1e5e9",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: "24px",
    margin: "0 0 4px 0",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    width: "32px",
    height: "32px",
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
    padding: "24px",
    overflow: "auto",
    flex: 1,
  },
  leftColumn: {
    flex: 1.2,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  rightColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "600",
    color: "#374151",
    fontSize: "14px",
    marginBottom: "4px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    transition: "all 0.2s ease",
    backgroundColor: "#fff",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
    backgroundColor: "#fff",
    minHeight: "120px",
  },
  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    backgroundColor: "#fff",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  disabledSelect: {
    backgroundColor: "#f9fafb",
    color: "#9ca3af",
    cursor: "not-allowed",
  },
  section: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e1e5e9",
    borderRadius: "12px",
    padding: "16px",
    transition: "all 0.2s ease",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  sectionIcon: {
    fontSize: "16px",
  },
  sectionTitle: {
    margin: 0,
    fontWeight: "600",
    color: "#374151",
    fontSize: "14px",
  },
  timestamp: {
    fontSize: "12px",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "4px",
  },
  timestampIcon: {
    fontSize: "12px",
  },
  charCount: {
    fontSize: "12px",
    color: "#6b7280",
    textAlign: "right",
    marginTop: "4px",
  },
  highPriority: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  mediumPriority: {
    borderColor: "#f59e0b",
    backgroundColor: "#fffbeb",
  },
  lowPriority: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  footer: {
    padding: "16px 24px 24px 24px",
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e1e5e9",
  },
  footerContent: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "600",
  },
  saveBtn: {
    padding: "10px 24px",
    borderRadius: "8px",
    fontWeight: "600",
    backgroundColor: "#3b82f6",
    color: "white",
  },
  saveIcon: {
    marginRight: "6px",
  },
};

// Efeitos hover (adicionar via CSS-in-JS ou CSS global)
const hoverStyles = `
  .modal-input:focus, .modal-select:focus, .modal-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .modal-close-btn:hover {
    background-color: #f1f5f9;
    color: #374151;
  }
  
  .modal-section:hover {
    border-color: #cbd5e1;
  }
`;

// Adicionar estilos hover (opcional - pode ser feito via CSS global)
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  hoverStyles.split('}').forEach(rule => {
    if (rule.trim()) styleSheet.insertRule(rule + '}', styleSheet.cssRules.length);
  });
}

export default ModalNovoTicket;