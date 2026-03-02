// C:\Users\ruang\Desktop\jornada\components\ModalTicketMonitoring.tsx
import React, { useState, useEffect } from "react";
import Button from "./Button";
import TabsNavigation from "./TicketMonitoring/TabsNavigation";
import TabGeral from "./TicketMonitoring/TabGeral";
import TabTags from "./TicketMonitoring/TabTags";
import TabArquivos from "./TicketMonitoring/TabArquivos";
import TabHistorico from "./TicketMonitoring/TabHistorico";
import type { Ticket, Tag, Comentario, Usuario } from "../src/types";
import { useNavigate } from "react-router-dom";


interface ModalTicketMonitoringProps {
  ticket: Ticket;
  onClose: () => void;
  onTicketUpdated?: (updatedTicket: Ticket) => void;
}

interface Attachment {
  id: number;
  filename: string;
  mime_type: string;
  size_bytes: number;
  is_image: boolean;
  created_at?: string;
}

const ModalTicketMonitoring: React.FC<ModalTicketMonitoringProps> = ({ ticket, onClose, onTicketUpdated }) => {
  const [status, setStatus] = useState(ticket.status);
  const [prioridade, setPrioridade] = useState(ticket.prioridade);
  const [categoria, setCategoria] = useState(ticket.categoria);
  const [descricao, setDescricao] = useState(ticket.descricao);
  const [assignedUserId] = useState(ticket.assigned_user_id ?? 0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Estados para as abas
  const [activeTab, setActiveTab] = useState("geral");

  // Estados para tags
  const [tags, setTags] = useState<Tag[]>([]);
  const [ticketTags, setTicketTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<number | "">("");

  // ---------------------------
  // 🔹 ATTACHMENTS (TICKET)
  // ---------------------------
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Estados para comentários
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [carregandoComentarios, setCarregandoComentarios] = useState(false);
  const [usuarioAtual] = useState<Usuario>(() => {
    // Recupera usuário do localStorage (vem do login)
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          id: user.id || 0,
          nome: user.nome || "Usuário",
          email: user.email || "",
          role: user.role || ""
        };
      } catch {
        return { id: 0, nome: "Usuário", email: "", role: "" };
      }
    }
    return { id: 0, nome: "Usuário", email: "", role: "" };
  });

  // Definição das abas
  const tabs = [
    { id: "geral", label: "Geral" },
    { id: "tags", label: "Tags" },
    { id: "arquivos", label: "Arquivos" },
    { id: "historico", label: "Comentários"},
  ];

  // ============================================================
  // 🔹 Buscar todas as tags do sistema
  // ============================================================
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true);

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const resp = await fetch(
          "https://backend.sansolenergiasolar.com.br/api/v1/tags",
          {
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
          throw new Error("Erro ao carregar tags");
        }

        const data = await resp.json();
        setTags(data);
      } catch (err) {
        console.error("Erro ao carregar tags", err);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, []);


  useEffect(() => {
    if (activeTab === "arquivos") {
      fetchTicketAttachments();
    }
  }, [activeTab, ticket.id]);


  // ============================================================
  // 🔹 Buscar tags aplicadas ao ticket
  // ============================================================
  useEffect(() => {
    const fetchTicketTags = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const resp = await fetch(
          `https://backend.sansolenergiasolar.com.br/api/v1/tags/entity/ticket/${ticket.id}`,
          {
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
          throw new Error("Erro ao carregar tags do ticket");
        }

        const data = await resp.json();
        setTicketTags(data);
      } catch (err) {
        console.error("Erro ao carregar tags do ticket", err);
      }
    };

    fetchTicketTags();
  }, [ticket.id]);

  // ============================================================
  // 🔹 Buscar comentários do ticket
  // ============================================================
  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        setCarregandoComentarios(true);

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `https://backend.sansolenergiasolar.com.br/api/v1/comentarios/tickets/${ticket.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setComentarios(data);
          return;
        }

        if (response.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }

        // 🔹 Fallback para endpoint genérico
        if (response.status === 404) {
          const response2 = await fetch(
            `https://backend.sansolenergiasolar.com.br/api/v1/comentarios?ticket_id=${ticket.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response2.ok) {
            const data = await response2.json();
            setComentarios(data);
          } else if (response2.status === 401) {
            localStorage.clear();
            navigate("/login");
          } else {
            setComentarios([]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar comentários:", error);
        setComentarios([]);
      } finally {
        setCarregandoComentarios(false);
      }
    };

    if (activeTab === "historico") {
      fetchComentarios();
    }
  }, [ticket.id, activeTab]);

  // ============================================================
  // 🔹 Anexar tag ao ticket
  // ============================================================
  const anexarTagAoTicket = async () => {
    if (!selectedTagId) return;
    if (!window.confirm("Deseja realmente adicionar esta tag ao ticket?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const resp = await fetch(
        "https://backend.sansolenergiasolar.com.br/api/v1/tags/attach",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tag_id: selectedTagId,
            entity_type: "ticket",
            entity_id: ticket.id,
          }),
        }
      );

      if (!resp.ok) {
        if (resp.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        throw new Error("Erro ao anexar tag");
      }

      const updated = await fetch(
        `https://backend.sansolenergiasolar.com.br/api/v1/tags/entity/ticket/${ticket.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedTags = await updated.json();
      setTicketTags(updatedTags);
      setSelectedTagId("");
    } catch (err) {
      console.error("Erro ao anexar tag ao ticket", err);
      alert("Erro ao anexar tag");
    }
  };

  const fetchTicketAttachments = async () => {
  try {
    setLoadingAttachments(true);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const resp = await fetch(
      "https://backend.sansolenergiasolar.com.br/api/v1/attachments/list",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          cliente_id: ticket.cliente_id,
        }),
      }
    );

    if (!resp.ok) {
      if (resp.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      throw new Error("Erro ao buscar anexos do ticket");
    }

    const data = await resp.json();
    setAttachments(data);
  } catch (err) {
    console.error("Erro ao buscar anexos do ticket:", err);
  } finally {
    setLoadingAttachments(false);
  }
};

  const uploadTicketAttachment = async (file: File) => {
  try {
    setUploadingAttachment(true);

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const formData = new FormData();
    formData.append("cliente_id", String(ticket.cliente_id));
    formData.append("file", file);

    const resp = await fetch(
      "https://backend.sansolenergiasolar.com.br/api/v1/attachments/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!resp.ok) throw new Error("Erro no upload");

    const uploaded = await resp.json();

    await fetch(
      `https://backend.sansolenergiasolar.com.br/api/v1/attachments/${uploaded.id}/confirm`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: uploaded.filename,
          mime_type: uploaded.mime_type,
          size_bytes: file.size,
          checksum: "",
          is_image: uploaded.is_image,
        }),
      }
    );

    await fetch(
      `https://backend.sansolenergiasolar.com.br/api/v1/attachments/${uploaded.id}/link`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
        }),
      }
    );

    fetchTicketAttachments();

  } catch (err) {
    console.error(err);
    alert("Erro ao enviar arquivo");
  } finally {
    setUploadingAttachment(false);
  }
};

  const downloadAttachment = async (attachmentId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const resp = await fetch(
      `https://backend.sansolenergiasolar.com.br/api/v1/attachments/${attachmentId}/presign-download`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await resp.json();
    window.open(data.download_url, "_blank");
  };

  // ============================================================
  // 🔹 Remover tag do ticket
  // ============================================================
  const removerTag = async (tagId: number) => {
    if (!window.confirm("Deseja realmente remover esta tag do ticket?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const resp = await fetch(
        "https://backend.sansolenergiasolar.com.br/api/v1/tags/detach",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tag_id: tagId,
            entity_type: "ticket",
            entity_id: ticket.id,
          }),
        }
      );

      if (!resp.ok) {
        if (resp.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        throw new Error("Erro ao remover tag");
      }

      setTicketTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (err) {
      console.error("Erro ao remover tag", err);
      alert("Erro ao remover tag");
    }
  };

  // ----- Adicionar Comentário
  const adicionarComentario = async (texto: string) => {
    const token = localStorage.getItem("token");

    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `https://backend.sansolenergiasolar.com.br/api/v1/comentarios/tickets/${ticket.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ texto }),
        }
      );

      if (response.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erro ao adicionar comentário");
      }

      const novoComentario = await response.json();
      setComentarios((prev) => [novoComentario, ...prev]);
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      alert("Erro ao adicionar comentário");
    } finally {
      console.log("TOKEN USADO NA REQUISIÇÃO:", token);
    }
  };


  // ============================================================
  // 🔹 Deletar comentário do ticket
  // ============================================================
  const deletarComentario = async (comentarioId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `https://backend.sansolenergiasolar.com.br/api/v1/comentarios/${comentarioId}`,
        {
          method: "DELETE",
          headers: {
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
        throw new Error("Erro ao deletar comentário");
      }

      setComentarios((prev) => prev.filter((c) => c.id !== comentarioId));
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);
      alert("Erro ao deletar comentário");
    }
  };

  // ============================================================
  // 🔹 Atualizar ticket
  // ============================================================
  const atualizarTicket = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `https://backend.sansolenergiasolar.com.br/api/v1/tickets/${ticket.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            titulo: ticket.titulo,
            descricao,
            status,
            prioridade,
            categoria,
            assigned_user_id: assignedUserId,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        throw new Error("Erro ao atualizar ticket");
      }

      const updated = await response.json();
      onTicketUpdated?.(updated);
      alert("Ticket atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
      alert("Erro ao atualizar ticket");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔹 Fechar ticket
  // ============================================================
  const fecharTicket = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `https://backend.sansolenergiasolar.com.br/api/v1/tickets/${ticket.id}/close`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao fechar ticket");

      const updated = await response.json();
      onTicketUpdated?.(updated);
      alert("Ticket fechado com sucesso!");
    } catch (error) {
      console.error("Erro ao fechar ticket:", error);
      alert("Erro ao fechar ticket");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔹 Claim ticket
  // ============================================================
  const claimTicket = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `https://backend.sansolenergiasolar.com.br/api/v1/tickets/${ticket.id}/claim`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao assumir ticket");

      const updated = await response.json();
      onTicketUpdated?.(updated);
      alert("Ticket assumido com sucesso!");
    } catch (error) {
      console.error("Erro ao assumir ticket:", error);
      alert("Erro ao assumir ticket");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔹 Renderizar conteúdo da aba ativa
  // ============================================================
  const renderTabContent = () => {
    switch (activeTab) {
      case "geral":
        return (
          <TabGeral
            ticket={ticket}
            status={status}
            setStatus={setStatus}
            prioridade={prioridade}
            setPrioridade={setPrioridade}
            categoria={categoria}
            setCategoria={setCategoria}
            descricao={descricao}
            setDescricao={setDescricao}
            loading={loading}
            onAtualizar={atualizarTicket}
            onClaim={claimTicket}
            onFechar={fecharTicket}
          />
        );

      case "tags":
        return (
          <TabTags
            ticketTags={ticketTags}
            tags={tags}
            loadingTags={loadingTags}
            selectedTagId={selectedTagId}
            setSelectedTagId={setSelectedTagId}
            onAdicionarTag={anexarTagAoTicket}
            onRemoverTag={removerTag}
          />
        );

      case "arquivos":
        return (
          <TabArquivos
            attachments={attachments}
            loading={loadingAttachments}
            uploading={uploadingAttachment}
            onUpload={uploadTicketAttachment}
            onDownload={downloadAttachment}
          />
        );

      case "historico":
        return (
          <TabHistorico
            ticketId={ticket.id}
            comentarios={comentarios}
            usuarioAtual={usuarioAtual}
            onAdicionarComentario={adicionarComentario}
            onDeletarComentario={deletarComentario}
            carregando={carregandoComentarios}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          padding: "32px",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          border: "1px solid #f1f5f9",
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          borderBottom: "1px solid #f1f5f9",
          paddingBottom: "20px"
        }}>
          <div>
            <h2 style={{
              margin: "0 0 8px 0",
              color: "#1e293b",
              fontSize: "1.5rem",
              fontWeight: "700",
              lineHeight: "1.3"
            }}>
              {ticket.titulo}
            </h2>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <span style={{
                background: "#f1f5f9",
                color: "#475569",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "500"
              }}>
                ID: #{ticket.id}
              </span>
              <span style={{
                background: status === "fechado" ? "#dcfce7" :
                  status === "em_andamento" ? "#fef3c7" :
                    status === "pendente" ? "#f3f4f6" : "#dbeafe",
                color: status === "fechado" ? "#166534" :
                  status === "em_andamento" ? "#92400e" :
                    status === "pendente" ? "#4b5563" : "#1e40af",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "500",
                textTransform: "capitalize"
              }}>
                {status.replace("_", " ")}
              </span>
            </div>
          </div>

          <Button
            variant="neutral"
            onClick={onClose}
            style={{
              padding: "8px 12px",
              minWidth: "auto",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </Button>
        </div>

        {/* Navegação por Abas */}
        <TabsNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Conteúdo da Aba Ativa */}
        <div style={{ minHeight: "300px" }}>
          {renderTabContent()}
        </div>

      </div>
    </div>
  );
};

export default ModalTicketMonitoring;