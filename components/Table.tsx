// src/components/Table.tsx
import React from "react";

interface TableProps<T> {
  data: T[];
  columns: (keyof T | "ações")[]; // permitir coluna "ações"
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onCellClick?: (row: T, column: keyof T | "ações") => void;
  renderCell?: (row: T, column: keyof T | "ações") => React.ReactNode;
}

function Table<T>({
  data,
  columns,
  page,
  pageSize,
  onPageChange,
  onCellClick,
  renderCell,
}: TableProps<T>) {
  const totalPages = Math.ceil(data.length / pageSize);
  const start = (page - 1) * pageSize;
  const pagedData = data.slice(start, start + pageSize);

  const formatColumnName = (col: string): string => {
  const labels: Record<string, string> = {
    cliente: "Cliente",
    capacidade: "Capacidade (kWp)",
    endereco: "Endereço",
    status: "Status",
    geracao: "Geração (kW)",
    ações: "Ações",
  };

  // se existir label customizada, usa ela
  if (labels[col]) return labels[col];

  // fallback padrão
  return col
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        border: "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          overflowX: "auto",
          maxHeight: "calc(100vh - 200px)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "600px",
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          }}
        >
          <thead>
            <tr style={{ 
              background: "linear-gradient(135deg, #ff7a2d 0%, #ff5722 100%)",
              color: "#ffffff",
            }}>
              {columns.map((col) => (
                <th
                  key={String(col)}
                  style={{
                    textAlign: "left",
                    padding: "16px 12px",
                    fontWeight: "600",
                    fontSize: "13px",
                    letterSpacing: "0.5px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    minWidth: "140px",
                    position: "sticky",
                    top: 0,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {formatColumnName(String(col))}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pagedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length}
                  style={{
                    padding: "48px 20px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <div style={{ fontSize: "24px", opacity: 0.5 }}>📊</div>
                    Nenhum dado encontrado
                  </div>
                </td>
              </tr>
            ) : (
              pagedData.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fefaf7",
                    transition: "all 0.2s ease",
                    borderBottom: "1px solid #f8f4f0",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff5eb";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 122, 45, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#fefaf7";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col)}
                      style={{
                        padding: "14px 12px",
                        fontSize: "14px",
                        color: "#334155",
                        borderBottom: "1px solid #f8f4f0",
                        cursor: onCellClick ? "pointer" : "default",
                        transition: "all 0.2s ease",
                        position: "relative",
                      }}
                      onClick={() => onCellClick?.(row, col)}
                      onMouseEnter={(e) => {
                        if (onCellClick) {
                          e.currentTarget.style.backgroundColor = "rgba(255, 122, 45, 0.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (onCellClick) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          minHeight: "20px",
                        }}
                      >
                        {renderCell ? renderCell(row, col) : String(row[col as keyof T] ?? "-")}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação Modernizada */}
      {totalPages > 0 && (
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fefaf7",
            borderTop: "1px solid #f8f4f0",
          }}
        >
          <div
            style={{
              color: "#64748b",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Mostrando {start + 1}-{Math.min(start + pageSize, data.length)} de {data.length} registros
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                padding: "8px 16px",
                background: page === 1 
                  ? "#f8f4f0" 
                  : "linear-gradient(135deg, #ff7a2d 0%, #ff5722 100%)",
                color: page === 1 ? "#a8a29e" : "#ffffff",
                border: "none",
                borderRadius: "8px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s ease",
                boxShadow: page === 1 ? "none" : "0 2px 8px rgba(255, 122, 45, 0.3)",
                minWidth: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                if (page !== 1) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 122, 45, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== 1) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(255, 122, 45, 0.3)";
                }
              }}
            >
              ‹
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                margin: "0 12px",
              }}
            >
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    style={{
                      padding: "8px 12px",
                      background: page === pageNum
                        ? "linear-gradient(135deg, #ff7a2d 0%, #ff5722 100%)"
                        : "transparent",
                      color: page === pageNum ? "#ffffff" : "#64748b",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: page === pageNum ? "600" : "500",
                      fontSize: "14px",
                      minWidth: "32px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (page !== pageNum) {
                        e.currentTarget.style.background = "rgba(255, 122, 45, 0.1)";
                        e.currentTarget.style.color = "#ff7a2d";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (page !== pageNum) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#64748b";
                      }
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              style={{
                padding: "8px 16px",
                background: page === totalPages
                  ? "#f8f4f0"
                  : "linear-gradient(135deg, #ff7a2d 0%, #ff5722 100%)",
                color: page === totalPages ? "#a8a29e" : "#ffffff",
                border: "none",
                borderRadius: "8px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s ease",
                boxShadow: page === totalPages ? "none" : "0 2px 8px rgba(255, 122, 45, 0.3)",
                minWidth: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                if (page !== totalPages) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 122, 45, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== totalPages) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(255, 122, 45, 0.3)";
                }
              }}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;