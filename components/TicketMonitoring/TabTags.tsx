// C:\Users\ruang\Desktop\jornada\components\TicketMonitoring\TabTags.tsx
import React from "react";
import Button from "../Button";
import type { Tag } from "../../src/types";
import TagBadge from "../TagBadge";

interface TabTagsProps {
  ticketTags: Tag[];
  tags: Tag[];
  loadingTags: boolean;
  selectedTagId: number | "";
  setSelectedTagId: (id: number | "") => void;
  onAdicionarTag: () => void;
  onRemoverTag: (tagId: number) => void;
}

const TabTags: React.FC<TabTagsProps> = ({
  ticketTags,
  tags,
  loadingTags,
  selectedTagId,
  setSelectedTagId,
  onAdicionarTag,
  onRemoverTag,
}) => {
  return (
    <div>
      {/* ================= TAGS APLICADAS ================= */}
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            margin: "0 0 12px 0",
            color: "#1e293b",
            fontSize: "1.1rem",
            fontWeight: "600",
          }}
        >
          🏷️ Tags Aplicadas
        </h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          {ticketTags.length === 0 ? (
            <div
              style={{
                background: "#f8fafc",
                padding: "24px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px dashed #cbd5e1",
                width: "100%",
              }}
            >
              <span style={{ color: "#94a3b8" }}>
                Nenhuma tag aplicada ao ticket.
              </span>
            </div>
          ) : (
            ticketTags.map((tag) => (
              <div
                key={tag.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <TagBadge
                  label={tag.name}
                  color={tag.color}
                  size="sm"
                />

                <button
                  onClick={() => onRemoverTag(tag.id)}
                  title="Remover tag"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: "14px",
                    padding: "0 4px",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* ================= ADICIONAR TAG ================= */}
        <div style={{ marginBottom: "24px" }}>
          <h4
            style={{
              margin: "0 0 12px 0",
              color: "#1e293b",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            Adicionar Nova Tag
          </h4>

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              value={selectedTagId}
              onChange={(e) => setSelectedTagId(Number(e.target.value))}
              disabled={loadingTags}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                fontSize: "0.95rem",
                background: "#ffffff",
              }}
            >
              <option value="">Selecione uma tag...</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>

            <Button
              variant="edit"
              onClick={onAdicionarTag}
              disabled={loadingTags || !selectedTagId}
              style={{ minWidth: "120px" }}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </div>

      {/* ================= TAGS DISPONÍVEIS ================= */}
      <div>
        <h4
          style={{
            margin: "0 0 12px 0",
            color: "#1e293b",
            fontSize: "1rem",
            fontWeight: "600",
          }}
        >
          Tags Disponíveis
        </h4>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {tags.map((tag) => (
            <div
              key={tag.id}
              style={{
                opacity: ticketTags.some((t) => t.id === tag.id) ? 0.5 : 1,
              }}
            >
              <TagBadge
                label={tag.name}
                color={tag.color}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabTags;