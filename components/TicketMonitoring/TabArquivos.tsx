// components/TicketMonitoring/TabArquivos.tsx
import React, { useRef, useState } from "react";
import Button from "../Button";
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  Download, 
  Trash2, 
  Eye,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileAudio,
  FileVideo,
  Loader2,
  FolderUp,
  MoreVertical
} from "lucide-react";

interface Attachment {
  id: number;
  filename: string;
  mime_type: string;
  size_bytes: number;
  is_image: boolean;
  created_at?: string;
  uploaded_by?: string;
  url?: string;
}

interface TabArquivosProps {
  attachments: Attachment[];
  loading: boolean;
  uploading: boolean;
  uploadProgress?: number;
  onUpload: (file: File) => void;
  onDownload: (attachmentId: number) => void;
  onDelete?: (attachmentId: number) => void;
  onPreview?: (attachment: Attachment) => void;
}

const TabArquivos: React.FC<TabArquivosProps> = ({
  attachments,
  loading,
  uploading,
  uploadProgress = 0,
  onUpload,
  onDownload,
  onDelete,
  onPreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFile(file)) {
        onUpload(file);
      }
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      onUpload(file);
    }
  };

  const validateFile = (file: File): boolean => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert("Arquivo muito grande. Tamanho máximo: 50MB");
      return false;
    }
    return true;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getFileIcon = (filename: string, isImage: boolean, mimeType: string) => {
    if (isImage) return <ImageIcon size={20} className="file-icon" />;
    
    console.log(`Arquivo: ${filename}`);

    const type = mimeType.split('/')[0];
    
    switch (type) {
      case 'application':
        if (mimeType.includes('pdf')) return <FileText size={20} className="file-icon" />;
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) 
          return <FileSpreadsheet size={20} className="file-icon" />;
        if (mimeType.includes('zip') || mimeType.includes('compressed')) 
          return <FileArchive size={20} className="file-icon" />;
        return <File size={20} className="file-icon" />;
      case 'audio':
        return <FileAudio size={20} className="file-icon" />;
      case 'video':
        return <FileVideo size={20} className="file-icon" />;
      default:
        return <File size={20} className="file-icon" />;
    }
  };

  const getFileColor = (isImage: boolean, mimeType: string) => {
    if (isImage) return '#10b981';
    
    const type = mimeType.split('/')[0];
    switch (type) {
      case 'application':
        if (mimeType.includes('pdf')) return '#ef4444';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) 
          return '#10b981';
        if (mimeType.includes('word')) return '#3b82f6';
        return '#6b7280';
      case 'audio':
        return '#8b5cf6';
      case 'video':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const handleDownload = (attachment: Attachment) => {
    if (onPreview && attachment.is_image && attachment.url) {
      onPreview(attachment);
    } else {
      onDownload(attachment.id);
    }
  };

  // Estilos CSS
  const styles = `
    .file-card {
      transition: all 0.2s ease;
      animation: slideIn 0.3s ease;
    }
    
    .file-card:hover {
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
    
    .file-icon {
      transition: transform 0.2s ease;
    }
    
    .file-card:hover .file-icon {
      transform: scale(1.1);
    }
    
    .drag-over {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
      border-color: #0ea5e9 !important;
    }
    
    .upload-progress {
      transition: width 0.3s ease;
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
        {/* 🔹 Área de Upload */}
        {/* ===================================================== */}
        <div
          style={{
            border: `2px dashed ${dragOver ? '#0ea5e9' : '#cbd5e1'}`,
            borderRadius: "20px",
            padding: "48px 24px",
            textAlign: "center",
            background: dragOver 
              ? "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)" 
              : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            marginBottom: "32px",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1,
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
          }}
          onClick={() => {
            if (!uploading) {
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={dragOver ? "drag-over" : ""}
        >
          {/* Progress bar durante upload */}
          {uploading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "4px",
                background: "linear-gradient(90deg, #10b981, #0ea5e9)",
                width: `${uploadProgress}%`,
                borderRadius: "20px 0 0 0",
              }}
              className="upload-progress"
            />
          )}

          <div style={{ 
            width: "80px", 
            height: "80px", 
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            color: "white",
          }}>
            {uploading ? (
              <Loader2 size={36} className="spin" />
            ) : dragOver ? (
              <FolderUp size={36} />
            ) : (
              <Upload size={36} />
            )}
          </div>

          <h3 style={{ 
            margin: "0 0 8px", 
            color: "#1e293b", 
            fontSize: "1.25rem",
            fontWeight: "600"
          }}>
            {uploading ? "Enviando arquivo..." : dragOver ? "Solte o arquivo aqui" : "Arraste e solte"}
          </h3>
          
          <p style={{ 
            color: "#64748b", 
            marginBottom: "20px",
            fontSize: "0.95rem"
          }}>
            {uploading 
              ? `Enviando... ${uploadProgress}%`
              : "Solte seu arquivo aqui ou clique para selecionar"
            }
          </p>

          <div style={{ 
            fontSize: "0.85rem", 
            color: "#94a3b8",
            background: "white",
            display: "inline-block",
            padding: "8px 16px",
            borderRadius: "20px",
            border: "1px solid #e2e8f0",
            marginBottom: "24px"
          }}>
            📁 Suporta: PDF, DOC, XLS, PNG, JPG, ZIP (max. 50MB)
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Button
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                if (!uploading) {
                  fileInputRef.current?.click();
                }
              }}
              disabled={uploading}
              style={{ 
                padding: "12px 24px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Selecionar Arquivo
                </>
              )}
            </Button>

            <Button
              variant="neutral"
              onClick={(e) => {
                e.stopPropagation();
              }}
              disabled={uploading}
              style={{ padding: "12px 24px" }}
            >
              Cancelar
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileChange}
            disabled={uploading}
            multiple
          />
        </div>

        {/* ===================================================== */}
        {/* 🔹 Lista de Arquivos */}
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
            <File size={20} color="#64748b" />
            <h3 style={{ 
              margin: 0, 
              fontSize: "1.1rem", 
              fontWeight: "600",
              color: "#1e293b"
            }}>
              Arquivos Anexados
            </h3>
            <span style={{
              background: "#f1f5f9",
              color: "#64748b",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}>
              {attachments.length}
            </span>
          </div>

          {loading ? (
            <div style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderRadius: "16px",
              border: "2px dashed #e2e8f0",
            }}>
              <Loader2 size={48} color="#cbd5e1" className="spin" style={{ marginBottom: "16px" }} />
              <h4 style={{ margin: 0, color: "#64748b", fontWeight: "500" }}>
                Carregando arquivos...
              </h4>
            </div>
          ) : attachments.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderRadius: "16px",
              border: "2px dashed #e2e8f0",
            }}>
              <File size={48} color="#cbd5e1" style={{ marginBottom: "16px" }} />
              <h4 style={{ margin: 0, color: "#64748b", fontWeight: "500" }}>
                Nenhum arquivo anexado
              </h4>
              <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: "0.95rem" }}>
                Faça upload de arquivos para compartilhar com a equipe
              </p>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gap: "16px",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))"
            }}>
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="file-card"
                  style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    {/* Ícone do arquivo */}
                    <div style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "12px",
                      background: getFileColor(file.is_image, file.mime_type) + "20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: getFileColor(file.is_image, file.mime_type),
                      flexShrink: 0,
                    }}>
                      {getFileIcon(file.filename, file.is_image, file.mime_type)}
                    </div>
                    
                    {/* Informações do arquivo */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "flex-start",
                        marginBottom: "8px"
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{
                            margin: 0,
                            fontSize: "0.95rem",
                            fontWeight: "600",
                            color: "#1e293b",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {file.filename}
                          </h4>
                          
                          <div style={{ 
                            fontSize: "0.8rem", 
                            color: "#64748b",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginTop: "4px"
                          }}>
                            <span>{formatFileSize(file.size_bytes)}</span>
                            {file.created_at && (
                              <>
                                <span>•</span>
                                <span>{formatDate(file.created_at)}</span>
                              </>
                            )}
                          </div>
                          
                          {file.uploaded_by && (
                            <div style={{ 
                              fontSize: "0.75rem", 
                              color: "#94a3b8",
                              marginTop: "4px"
                            }}>
                              Enviado por: {file.uploaded_by}
                            </div>
                          )}
                        </div>
                        
                        {/* Menu de ações */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <button
                            onClick={() => setShowDeleteMenu(
                              showDeleteMenu === file.id ? null : file.id
                            )}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#94a3b8",
                              cursor: "pointer",
                              padding: "4px",
                              borderRadius: "6px",
                              marginLeft: "8px",
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
                          
                          {showDeleteMenu === file.id && (
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
                                onClick={() => {
                                  if (onPreview) onPreview(file);
                                  setShowDeleteMenu(null);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "10px 16px",
                                  background: "none",
                                  border: "none",
                                  textAlign: "left",
                                  color: "#3b82f6",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  fontSize: "0.9rem",
                                  borderBottom: "1px solid #f1f5f9",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#f0f9ff";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "none";
                                }}
                              >
                                <Eye size={16} />
                                Visualizar
                              </button>
                              
                              <button
                                onClick={() => {
                                  onDownload(file.id);
                                  setShowDeleteMenu(null);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "10px 16px",
                                  background: "none",
                                  border: "none",
                                  textAlign: "left",
                                  color: "#10b981",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  fontSize: "0.9rem",
                                  borderBottom: "1px solid #f1f5f9",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#f0fdf4";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "none";
                                }}
                              >
                                <Download size={16} />
                                Download
                              </button>
                              
                              {onDelete && (
                                <button
                                  onClick={() => {
                                    onDelete(file.id);
                                    setShowDeleteMenu(null);
                                  }}
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
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Botões de ação */}
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        <Button
                          variant="neutral"
                          onClick={() => handleDownload(file)}
                          style={{ 
                            padding: "8px 16px",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          {file.is_image ? (
                            <>
                              <Eye size={14} />
                              Visualizar
                            </>
                          ) : (
                            <>
                              <Download size={14} />
                              Download
                            </>
                          )}
                        </Button>
                        
                        {onDelete && (
                          <Button
                            variant="neutral"
                            onClick={() => onDelete(file.id)}
                            style={{ 
                              padding: "8px 16px",
                              fontSize: "0.85rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                          >
                            <Trash2 size={14} />
                            Excluir
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Thumbnail para imagens */}
                  {file.is_image && file.url && (
                    <div style={{ 
                      marginTop: "16px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      cursor: "pointer",
                    }}
                    onClick={() => onPreview && onPreview(file)}
                    >
                      <div style={{
                        width: "100%",
                        height: "120px",
                        backgroundImage: `url(${file.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TabArquivos;