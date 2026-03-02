// C:\Users\ruang\Desktop\jornada\components\TicketMonitoring\TabHistorico.tsx
import React, { useEffect, useState, useRef } from "react";
import Button from "../Button";
import type { Comentario, Usuario } from "../../src/types";
import {
  MessageSquare,
  User,
  Clock,
  AtSign,
  Trash2,
  MoreVertical,
  CheckCircle,
} from "lucide-react";

interface TabHistoricoProps {
  ticketId: number;
  comentarios: Comentario[];
  usuarioAtual: Usuario;
  onAdicionarComentario: (texto: string) => Promise<void>;
  onDeletarComentario?: (comentarioId: number) => Promise<void>;
  carregando: boolean;
}

const ROLES_PERMITIDOS = ["admin", "tecnico", "telemarketing"];

const TabHistorico: React.FC<TabHistoricoProps> = ({
  comentarios,
  onAdicionarComentario,
  onDeletarComentario,
  usuarioAtual,
  carregando
}) => {
  const [novoComentario, setNovoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState<number | null>(null);

  // 🔹 Estados para menções
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // 🔹 Carregar usuários permitidos
  // ============================================================
  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          "https://backend.sansolenergiasolar.com.br/api/v1/auth/usuarios?limit=1000",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        const permitidos = (data.items || []).filter((u: Usuario) =>
          ROLES_PERMITIDOS.includes(u.role)
        );

        setUsuarios(permitidos);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    };

    carregarUsuarios();
  }, []);

  // ============================================================
  // 🔹 Enviar comentário
  // ============================================================
  const handleEnviarComentario = async () => {
    if (!novoComentario.trim()) return;

    setEnviando(true);
    try {
      await onAdicionarComentario(novoComentario);
      setNovoComentario("");
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      alert("Erro ao enviar comentário. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  // ============================================================
  // 🔹 Deletar comentário
  // ============================================================
  const handleDeletarComentario = async (comentarioId: number) => {
    if (!onDeletarComentario) return;

    if (confirm("Tem certeza que deseja excluir este comentário?")) {
      try {
        await onDeletarComentario(comentarioId);
        setShowDeleteMenu(null);
      } catch (error) {
        console.error("Erro ao deletar comentário:", error);
      }
    }
  };

  // ============================================================
  // 🔹 Ordenar comentários - CORRIGIDO: mais recentes primeiro
  // ============================================================
  const comentariosOrdenados = [...comentarios].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  // ============================================================
  // 🔹 Manipular digitação + detectar @
  // ============================================================
  const handleChangeComentario = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const valor = e.target.value;
    setNovoComentario(valor);

    const cursorPos = e.target.selectionStart;
    const textoAteCursor = valor.substring(0, cursorPos);

    // Regex melhorada para capturar apenas o nome após @
    const match = textoAteCursor.match(/@([\w\sÀ-ÿ]+)$/i);

    if (match && textareaRef.current) {
      const busca = match[1].toLowerCase();
      const filtrados = usuarios.filter((u) =>
        u.nome.toLowerCase().includes(busca)
      );

      setUsuariosFiltrados(filtrados);

      // Calcular posição do cursor para o dropdown
      const textarea = textareaRef.current;
      const lineHeight = 20;
      const lines = textoAteCursor.split('\n').length;
      const top = textarea.offsetTop + (lines * lineHeight);
      const left = textarea.offsetLeft;

      setDropdownPosition({ top, left });
      setMostrarDropdown(filtrados.length > 0);
    } else {
      setMostrarDropdown(false);
    }
  };

  // ============================================================
  // 🔹 Selecionar usuário no dropdown
  // ============================================================
  const selecionarUsuario = (usuario: Usuario) => {
    const textoAntesCursor = novoComentario.substring(0, textareaRef.current?.selectionStart || 0);
    const textoDepoisCursor = novoComentario.substring(textareaRef.current?.selectionStart || 0);

    // Encontrar a última ocorrência de @ antes do cursor
    const ultimoArroba = textoAntesCursor.lastIndexOf('@');
    const textoAntesArroba = textoAntesCursor.substring(0, ultimoArroba);

    const textoAtualizado = textoAntesArroba + `@${usuario.nome} ` + textoDepoisCursor;

    setNovoComentario(textoAtualizado);
    setMostrarDropdown(false);

    // Focar no textarea após um pequeno delay
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = textoAntesArroba.length + usuario.nome.length + 2; // +2 para @ e espaço
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const formatarData = (dataString: string) => {
    try {
      const dataUtc = new Date(dataString + "Z");
      const agora = new Date();
      const diferencaMs = agora.getTime() - dataUtc.getTime();
      const diferencaMin = Math.floor(diferencaMs / (1000 * 60));
      const diferencaHrs = Math.floor(diferencaMs / (1000 * 60 * 60));
      const diferencaDias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

      if (diferencaMin < 1) return "Agora mesmo";
      if (diferencaMin < 60) return `Há ${diferencaMin} min`;
      if (diferencaHrs < 24) return `Há ${diferencaHrs} h`;
      if (diferencaDias === 1) return "Ontem";
      if (diferencaDias < 7) return `Há ${diferencaDias} dias`;

      return dataUtc.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dataString;
    }
  };

  // 🔹 Destacar menções no texto - CORRIGIDO: captura apenas o nome
  const renderTextoComMencao = (texto: string = "") => {
    // Regex melhorada: captura @ seguido de letras, espaços e acentos
    // Para @ seguido imediatamente por palavra e opcionalmente mais palavras
    const regex = /(@[\wÀ-ÿ]+(?:\s[\wÀ-ÿ]+)*)/gi;

    const partes = texto.split(regex);

    return partes.map((parte, index) => {
      // Verifica se a parte começa com @ e contém apenas o nome
      if (parte.startsWith('@') && /^@[\wÀ-ÿ]+(?:\s[\wÀ-ÿ]+)*$/i.test(parte)) {
        return (
          <span
            key={index}
            className="mention"
          >
            {parte}
          </span>
        );
      }
      return <span key={index}>{parte}</span>;
    });
  };

  // Teste da função renderTextoComMencao
  useEffect(() => {
    // Teste para verificar o funcionamento
    console.log("Teste de menções:");
    console.log("Entrada: '@Leandro Soares eu que agradeço!'");
    console.log("Resultado esperado: destaca apenas '@Leandro Soares'");
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    };

    if (mostrarDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarDropdown]);

  // Estilos CSS
  const styles = `
    .mention {
      background: linear-gradient(135deg, #FF7A2D15, #FF7A2D25);
      color: #FF7A2D;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 600;
      margin: 0 2px;
      border: 1px solid #FF7A2D30;
      display: inline-block;
    }
    
    .comment-card {
      position: relative;
      transition: all 0.2s ease;
      animation: slideIn 0.3s ease;
    }
    
    .comment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      color: white;
      background: linear-gradient(135deg, #FF7A2D, #FF9A3D);
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div style={{ padding: "8px" }}>
        {/* ===================================================== */}
        {/* 🔹 Formulário de comentário */}
        {/* ===================================================== */}
        <div
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "32px",
            border: "1px solid #e2e8f0",
            position: "relative",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF7A2D, #FF9A3D)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600", color: "#1e293b" }}>
                Adicionar Comentário
              </h4>
              <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#64748b" }}>
                Compartilhe atualizações ou mencione colegas usando @
              </p>
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <textarea
              ref={textareaRef}
              value={novoComentario}
              onChange={handleChangeComentario}
              placeholder="Digite seu comentário aqui... Use @nome para mencionar colegas."
              rows={4}
              style={{
                width: "95%",
                padding: "16px",
                borderRadius: "12px",
                border: "2px solid #e2e8f0",
                fontSize: "0.95rem",
                resize: "vertical",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                background: "white",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#FF7A2D";
                e.target.style.boxShadow = "0 0 0 3px rgba(255, 122, 45, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
              disabled={carregando}
            />

            {/* 🔽 Dropdown de menções */}
            {mostrarDropdown && usuariosFiltrados.length > 0 && (
              <div
                ref={dropdownRef}
                style={{
                  position: "absolute",
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  maxHeight: "250px",
                  overflowY: "auto",
                  zIndex: 1000,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  minWidth: "250px",
                }}
              >
                <div style={{
                  padding: "12px 16px",
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#64748b",
                  fontSize: "0.875rem",
                }}>
                  <AtSign size={14} />
                  <span>Mencionar usuário</span>
                </div>

                {usuariosFiltrados.map((u) => (
                  <div
                    key={u.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selecionarUsuario(u)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "white";
                    }}
                  >
                    <div className="user-avatar">
                      {u.nome.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "500", color: "#1e293b" }}>
                        {u.nome}
                      </div>
                      <div style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "2px"
                      }}>
                        <User size={10} />
                        <span>{u.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                padding: "8px 12px",
                background: "white",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.85rem",
                color: "#64748b",
              }}>
                <AtSign size={14} />
                <span>Use @ para mencionar</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Button
                variant="neutral"
                onClick={() => setNovoComentario("")}
                disabled={enviando || !novoComentario.trim() || carregando}
                style={{ padding: "10px 20px" }}
              >
                Limpar
              </Button>
              <Button
                variant="primary"
                onClick={handleEnviarComentario}
                disabled={enviando || !novoComentario.trim() || carregando}
                style={{
                  padding: "10px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                {enviando ? (
                  <>
                    <div style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid white",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }} />
                    Enviando...
                  </>
                ) : (
                  // Remover o <Send size={16} /> se o Button já tiver ícone
                  "Enviar Comentário"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ===================================================== */}
        {/* 🔹 Histórico de Comentários */}
        {/* ===================================================== */}
        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
            paddingBottom: "12px",
            borderBottom: "2px solid #f1f5f9"
          }}>
            <Clock size={20} color="#64748b" />
            <h3 style={{
              margin: 0,
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#1e293b"
            }}>
              Histórico de Comentários
            </h3>
            <span style={{
              background: "#f1f5f9",
              color: "#64748b",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}>
              {comentarios.length}
            </span>
          </div>

          {comentariosOrdenados.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderRadius: "16px",
              border: "2px dashed #e2e8f0",
            }}>
              <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
              <h4 style={{ margin: 0, color: "#64748b", fontWeight: "500" }}>
                Nenhum comentário ainda
              </h4>
              <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: "0.95rem" }}>
                Seja o primeiro a comentar neste ticket
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {comentariosOrdenados.map((comentario) => (
                <div
                  key={comentario.id}
                  className="comment-card"
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px" }}>
                    {/* Avatar */}
                    <div className="user-avatar">
                      {comentario.autor?.nome?.charAt(0).toUpperCase() || "U"}
                    </div>

                    {/* Conteúdo */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <strong style={{
                            fontSize: "1rem",
                            color: "#1e293b",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}>
                            {comentario.autor?.nome || "Usuário"}
                            {comentario.autor?.id === usuarioAtual.id && (
                              <span style={{
                                background: "#10b98120",
                                color: "#10b981",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}>
                                <CheckCircle size={10} />
                                Você
                              </span>
                            )}
                          </strong>
                          <div style={{
                            fontSize: "0.85rem",
                            color: "#64748b",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginTop: "4px"
                          }}>
                            <Clock size={12} />
                            {formatarData(comentario.created_at)}
                          </div>
                        </div>

                        {/* Menu de ações */}
                        {onDeletarComentario && (
                          <div style={{ position: "relative" }}>
                            <button
                              onClick={() => setShowDeleteMenu(
                                showDeleteMenu === comentario.id ? null : comentario.id
                              )}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#94a3b8",
                                cursor: "pointer",
                                padding: "4px",
                                borderRadius: "6px",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#f1f5f9";
                                e.currentTarget.style.color = "#64748b";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "none";
                                e.currentTarget.style.color = "#94a3b8";
                              }}
                            >
                              <MoreVertical size={20} />
                            </button>

                            {showDeleteMenu === comentario.id && (
                              <div style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                background: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                zIndex: 100,
                                minWidth: "140px",
                              }}>
                                <button
                                  onClick={() => handleDeletarComentario(comentario.id)}
                                  style={{
                                    width: "100%",
                                    padding: "10px 16px",
                                    background: "none",
                                    border: "none",
                                    textAlign: "left",
                                    color: "#ef4444",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "0.9rem",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#fef2f2";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "none";
                                  }}
                                >
                                  <Trash2 size={16} />
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{
                        marginTop: "16px",
                        padding: "16px",
                        background: "#f8fafc",
                        borderRadius: "12px",
                        fontSize: "0.95rem",
                        lineHeight: "1.5",
                        color: "#334155",
                      }}>
                        {renderTextoComMencao(comentario.texto)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TabHistorico;