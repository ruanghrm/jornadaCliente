import React from "react";
import type { DocumentosSectionProps } from "./types";

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['pdf'].includes(ext || '')) return '📄';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext || '')) return '🖼️';
  if (['doc', 'docx'].includes(ext || '')) return '📝';
  if (['xls', 'xlsx'].includes(ext || '')) return '📊';
  if (['zip', 'rar', '7z'].includes(ext || '')) return '📦';
  return '📎';
};

export const DocumentosTab: React.FC<DocumentosSectionProps> = ({
  attachments,
  loadingAttachments,
  uploading,
  dragOver,
  onUpload,
  onDownload,
  onDragOver
}) => {
  return (
    <div>
      {/* ÁREA DE UPLOAD */}
      <div
        style={{
          border: `2px dashed ${dragOver ? "#FF7A2D" : "#d1d5db"}`,
          borderRadius: "12px",
          padding: "32px",
          textAlign: "center",
          background: dragOver ? "#fff7ed" : "#f9fafb",
          marginBottom: "24px",
          transition: "all 0.3s ease",
          cursor: "pointer"
        }}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(true);
        }}
        onDragLeave={() => onDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          onDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) onUpload(file);
        }}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <div style={{
          fontSize: "48px",
          marginBottom: "16px",
          color: dragOver ? "#FF7A2D" : "#9ca3af"
        }}>
          📤
        </div>
        <h3 style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#1f2937",
          margin: "0 0 8px 0"
        }}>
          Arraste arquivos aqui
        </h3>
        <p style={{
          fontSize: "14px",
          color: "#6b7280",
          margin: "0 0 16px 0"
        }}>
          ou clique para selecionar arquivos
        </p>
        <div style={{
          fontSize: "12px",
          color: "#9ca3af",
          padding: "8px 16px",
          background: "#ffffff",
          borderRadius: "20px",
          display: "inline-block",
          border: "1px solid #e5e7eb"
        }}>
          PDF, JPG, PNG, DOC, XLS até 10MB
        </div>
        <input
          id="file-upload"
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
          style={{ display: "none" }}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
        />
        {uploading && (
          <div style={{
            marginTop: "16px",
            padding: "12px",
            background: "#fef3c7",
            borderRadius: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#92400e"
          }}>
            <div style={{
              width: "16px",
              height: "16px",
              border: "2px solid #fbbf24",
              borderTopColor: "#92400e",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
            Enviando arquivo...
          </div>
        )}
      </div>

      {/* LISTA DE ANEXOS */}
      <div style={{ flex: 1 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px"
        }}>
          <h3 style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#1f2937",
            margin: 0
          }}>
            Documentos Anexados ({attachments.length})
          </h3>
          <span style={{
            fontSize: "12px",
            color: "#6b7280",
            background: "#f3f4f6",
            padding: "4px 12px",
            borderRadius: "12px"
          }}>
            {loadingAttachments ? "Atualizando..." : "Atualizado"}
          </span>
        </div>

        {loadingAttachments ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
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
            Carregando documentos...
          </div>
        ) : attachments.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px",
            background: "#f9fafb",
            borderRadius: "12px",
            border: "1px dashed #d1d5db"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "16px", color: "#9ca3af" }}>
              📄
            </div>
            <p style={{
              fontSize: "16px",
              fontWeight: "500",
              color: "#6b7280",
              margin: "0 0 8px 0"
            }}>
              Nenhum documento anexado
            </p>
            <p style={{
              fontSize: "14px",
              color: "#9ca3af",
              margin: 0
            }}>
              Faça upload de documentos acima
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "12px"
          }}>
            {attachments.map((att) => (
              <div
                key={att.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.2s",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                onClick={() => onDownload(att.id)}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    color: "#6b7280",
                    flexShrink: 0
                  }}>
                    {getFileIcon(att.filename)}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#1f2937",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {att.filename}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "2px"
                    }}>
                      {Math.round((att.size_bytes || 0) / 1024)} KB
                    </div>
                  </div>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                  color: "#9ca3af"
                }}>
                  <span>
                    {att.is_image ? "Imagem" : "Documento"} • {new Date(att.created_at || '').toLocaleDateString('pt-BR')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(att.id);
                    }}
                    style={{
                      background: "#FF7A2D",
                      color: "#ffffff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#FF6B00"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#FF7A2D"}
                  >
                    Baixar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};