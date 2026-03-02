import React, { useEffect, useState } from "react";
import Button from "../Button";
import Table from "../Table";
import { useNavigate } from "react-router-dom";

// Tipos
export interface Tag {
  id: number;
  name: string;
  color: string | null;
  scope: string;
  is_active: boolean;
  created_at: string;
}

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#FF7A2D");
  const navigate = useNavigate();

  // Cores padrão do tema laranja
  const defaultColors = [
  // Laranjas / Vermelhos
  "#FF7A2D", "#F97316", "#DC2626", "#EF4444",

  // Azuis
  "#2563EB", "#3B82F6", "#38BDF8", "#0EA5E9",

  // Verdes
  "#059669", "#10B981", "#4ADE80", "#16A34A",

  // Roxos / Rosas
  "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",

  // Amarelos
  "#EAB308", "#FACC15", "#F59E0B",

  // Neutras
  "#6B7280", "#9CA3AF", "#D1D5DB"
];
// ------------------------------------------------------------
// 🔹 Buscar todas as tags
// ------------------------------------------------------------
const fetchTags = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const res = await fetch(
      "https://backend.sansolenergiasolar.com.br/api/v1/tags",
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
      throw new Error("Erro ao buscar tags");
    }

    const data = await res.json();
    setTags(data);
  } catch (err) {
    console.error("Erro ao buscar tags", err);
    alert("Erro ao buscar tags");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchTags();
}, []);

// ------------------------------------------------------------
// 🔹 Criar nova tag
// ------------------------------------------------------------
const criarTag = async () => {
  if (!newTagName.trim()) {
    alert("Nome da tag é obrigatório");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const res = await fetch(
      "https://backend.sansolenergiasolar.com.br/api/v1/tags",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTagName,
          color: newTagColor,
          scope: "global",
        }),
      }
    );

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      const text = await res.text();
      throw new Error(text || "Erro ao criar tag");
    }

    setNewTagName("");
    setNewTagColor("#FF7A2D");
    fetchTags();
  } catch (err) {
    console.error(err);
    alert("Erro ao criar tag");
  }
};

// ------------------------------------------------------------
// 🔹 Ativar / desativar tag
// ------------------------------------------------------------
const toggleActive = async (tag: Tag) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const res = await fetch(
      `https://backend.sansolenergiasolar.com.br/api/v1/tags/${tag.id}/activate?active=${!tag.is_active}`,
      {
        method: "PATCH",
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
      throw new Error("Erro ao alterar status da tag");
    }

    fetchTags();
  } catch (err) {
    console.error(err);
    alert("Erro ao alterar status da tag");
  }
};

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>

      {/* Cabeçalho */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "#1F2937",
          margin: "0 0 4px 0"
        }}>
          Gerenciamento de Tags
        </h1>
        <p style={{
          fontSize: "14px",
          color: "#6B7280",
          margin: 0
        }}>
          Crie e gerencie tags para organizar seus recursos
        </p>
      </div>

      {/* Formulário de Criação */}
      <div style={{
        marginBottom: "32px",
        padding: "24px",
        background: "white",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}>
        <h3 style={{
          margin: "0 0 20px 0",
          fontSize: "18px",
          fontWeight: "600",
          color: "#111827"
        }}>
          Nova Tag
        </h3>
        
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 300px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Nome da Tag
            </label>
            <input
              type="text"
              placeholder="Digite o nome da tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #D1D5DB",
                fontSize: "14px",
                color: "#111827",
                background: "white",
                transition: "border-color 0.2s",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#FF7A2D"}
              onBlur={(e) => e.target.style.borderColor = "#D1D5DB"}
            />
          </div>

          <div style={{ flex: "0 0 auto" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Cor
            </label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: newTagColor,
                    border: "2px solid #F9FAFB",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s"
                  }}
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  style={{
                    width: "40px",
                    height: "40px",
                    cursor: "pointer",
                    border: "none",
                    padding: 0,
                    borderRadius: "8px",
                    overflow: "hidden"
                  }}
                  title="Selecionar cor"
                />
              </div>
            </div>
          </div>

          <div style={{ flex: "0 0 auto", alignSelf: "flex-end" }}>
            <Button 
              onClick={criarTag}
              variant="primary"
              style={{ 
                padding: "10px 24px",
                height: "40px",
                fontWeight: "500"
              }}
            >
              Criar Tag
            </Button>
          </div>
        </div>

        {/* Paleta de cores rápidas */}
        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #F3F4F6" }}>
          <p style={{ 
            margin: "0 0 12px 0",
            fontSize: "14px",
            color: "#6B7280",
            fontWeight: "500"
          }}>
            Cores sugeridas
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {defaultColors.map((color) => (
              <button
                key={color}
                onClick={() => setNewTagColor(color)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  background: color,
                  border: `2px solid ${newTagColor === color ? "#1F2937" : "white"}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}
                title={color}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Tags */}
      <div style={{ 
        background: "white",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #E5E7EB",
          background: "#F9FAFB"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h3 style={{ 
                margin: 0,
                fontSize: "18px",
                fontWeight: "600",
                color: "#111827"
              }}>
                Tags
              </h3>
              <p style={{ 
                margin: "4px 0 0 0",
                fontSize: "14px",
                color: "#6B7280"
              }}>
                Total: {tags.length} tags
              </p>
            </div>
            <div style={{ 
              display: "flex", 
              gap: "20px", 
              fontSize: "14px", 
              color: "#374151",
              background: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #E5E7EB"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#059669"
                }} />
                <span>Ativas: {tags.filter(t => t.is_active).length}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#DC2626"
                }} />
                <span>Inativas: {tags.filter(t => !t.is_active).length}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          {loading ? (
            <div style={{ 
              display: "flex",
              flexDirection: "column",
              alignItems: "center", 
              justifyContent: "center",
              padding: "48px",
              color: "#6B7280"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                border: "3px solid #F3F4F6",
                borderTopColor: "#FF7A2D",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "16px"
              }} />
              <p style={{ 
                margin: 0,
                fontSize: "14px",
                fontWeight: "500"
              }}>
                Carregando tags...
              </p>
            </div>
          ) : tags.length === 0 ? (
            <div style={{ 
              display: "flex",
              flexDirection: "column",
              alignItems: "center", 
              justifyContent: "center",
              padding: "48px",
              color: "#6B7280",
              textAlign: "center"
            }}>
              <div style={{
                width: "64px",
                height: "64px",
                background: "#F3F4F6",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                color: "#9CA3AF"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                </svg>
              </div>
              <p style={{ 
                margin: "0 0 8px 0",
                fontSize: "16px",
                fontWeight: "500",
                color: "#111827"
              }}>
                Nenhuma tag encontrada
              </p>
              <p style={{ 
                margin: 0,
                fontSize: "14px",
                color: "#6B7280",
                maxWidth: "400px"
              }}>
                Crie sua primeira tag usando o formulário acima para começar a organizar seus recursos.
              </p>
            </div>
          ) : (
            <Table
              data={tags}
              columns={["name", "color", "is_active", "ações"]}
              page={page}
              pageSize={10}
              onPageChange={setPage}
              renderCell={(row: Tag, col: string) => {
                if (col === "name")
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        background: row.color || "#F3F4F6",
                        border: "1px solid #E5E7EB"
                      }} />
                      <span style={{ 
                        color: "#111827",
                        fontWeight: "500"
                      }}>
                        {row.name}
                      </span>
                    </div>
                  );

                if (col === "color")
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        background: row.color || "#F3F4F6",
                        border: "1px solid #E5E7EB"
                      }} />
                      <span style={{ 
                        fontSize: "13px",
                        color: "#6B7280",
                        fontFamily: "monospace"
                      }}>
                        {row.color || "Sem cor"}
                      </span>
                    </div>
                  );

                if (col === "scope")
                  return (
                    <span style={{
                      fontSize: "13px",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontWeight: "500",
                      background: row.scope === "global" ? "#D1FAE5" : "#DBEAFE",
                      color: row.scope === "global" ? "#065F46" : "#1E40AF"
                    }}>
                      {row.scope === "global" ? "Global" : "Personalizada"}
                    </span>
                  );

                if (col === "is_active") 
                  return (
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: row.is_active ? "#059669" : "#DC2626"
                      }} />
                      <span style={{
                        color: row.is_active ? "#059669" : "#DC2626",
                        fontWeight: "500",
                        fontSize: "13px"
                      }}>
                        {row.is_active ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  );

                if (col === "ações") {
                  return (
                    <Button 
                      variant={row.is_active ? "danger" : "success"}
                      onClick={() => toggleActive(row)}
                      size="sm"
                      style={{
                        minWidth: "90px"
                      }}
                    >
                      {row.is_active ? "Desativar" : "Ativar"}
                    </Button>
                  );
                }

                return String(row[col as keyof Tag]);
              }}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TagsPage;