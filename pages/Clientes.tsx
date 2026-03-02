import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import Button from "../components/Button";
import TagBadge from "../components/TagBadge";
import ModalAdicionarCliente from "../components/ModalAdicionarCliente";
import ModalCliente from "../components/ModalCliente";
import type { Cliente, Tag } from "../src/types";
import { useNavigate } from "react-router-dom";
import { getCache, setCache } from "../util/cacheRegister";

type TicketRaw = {
  cliente_id: number | null;
};

// Interface para as usinas da integração Solarman
interface UsinaIntegracao {
  id: string;
  cliente_id: string;
  solarman_device_id: string;
  solarman_plant_id: string;
  solarman_email: string;
  createdAt: string;
}

// === COMPONENTE PARA CÉLULA DO NOME COM HOVER ===
const NomeClienteCell = ({
  row,
  onClienteClick
}: {
  row: Cliente & { tickets?: number; tags?: Tag[]; usinasIntegracao?: UsinaIntegracao[] };
  onClienteClick: (cliente: Cliente) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClienteClick(row)}
      style={{
        cursor: "pointer",
        transition: "all 0.2s",
        padding: "8px 0"
      }}
    >
      <div>
        <strong style={{
          color: isHovered ? "#FF7A2D" : "#1F2937",
          fontSize: "16px",
          fontWeight: "600",
          transition: "color 0.2s",
          display: "block",
          marginBottom: "8px"
        }}>
          {row.nome_completo}
        </strong>
      </div>

      {/* TAGS */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {row.tags && row.tags.length > 0 ? (
          row.tags.map((tag: Tag) => (
            <TagBadge
              key={tag.id}
              label={tag.name}
              color={tag.color}
              size="sm"
            />
          ))
        ) : (
          <span
            style={{
              fontSize: "12px",
              color: "#9CA3AF",
              fontStyle: "italic",
              padding: "4px 8px",
              background: "#F9FAFB",
              borderRadius: "6px",
            }}
          >
            Sem tags
          </span>
        )}
      </div>
    </div>
  );
};

// Função para buscar usinas de um cliente específico
const fetchUsinasCliente = async (
  clienteId: number,
  token: string,
  navigate: ReturnType<typeof useNavigate>
): Promise<UsinaIntegracao[]> => {
  const cacheKey = `@sansol/usinas/cliente/${clienteId}`;
  
  // Tenta pegar do cache primeiro
  const cached = getCache<UsinaIntegracao[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://backend.sansolenergiasolar.com.br/api/v1/integracoes/solarman/clientes/${clienteId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      localStorage.clear();
      navigate("/login");
      return [];
    }

    if (!response.ok) {
      // Se for 404 ou outro erro, retorna array vazio (cliente sem usinas)
      if (response.status === 404) return [];
      throw new Error(`Erro ao buscar usinas do cliente ${clienteId}`);
    }

    const data = await response.json();
    // O endpoint retorna um objeto ou um array? Pela documentação parece ser um objeto único
    // Vamos normalizar para array
    const usinas = Array.isArray(data) ? data : [data];
    
    // Salva no cache por 5 minutos (300 segundos)
    setCache(cacheKey, usinas);
    
    return usinas;
  } catch (error) {
    console.error(`Erro ao buscar usinas do cliente ${clienteId}:`, error);
    return [];
  }
};

// Função para buscar usinas em lotes (para evitar muitas requisições)
const fetchUsinasEmLote = async (
  clientes: (Cliente & { tickets?: number })[],
  token: string,
  navigate: ReturnType<typeof useNavigate>
): Promise<Record<number, UsinaIntegracao[]>> => {
  const usinasPorCliente: Record<number, UsinaIntegracao[]> = {};
  
  // Processa em lotes de 5 para não sobrecarregar a API
  const batchSize = 5;
  for (let i = 0; i < clientes.length; i += batchSize) {
    const batch = clientes.slice(i, i + batchSize);
    
    // Processa o lote em paralelo
    const promises = batch.map(async (cliente) => {
      const usinas = await fetchUsinasCliente(cliente.id, token, navigate);
      return { clienteId: cliente.id, usinas };
    });
    
    const resultados = await Promise.all(promises);
    
    // Adiciona os resultados ao objeto
    resultados.forEach(({ clienteId, usinas }) => {
      usinasPorCliente[clienteId] = usinas;
    });
    
    // Pequeno delay entre lotes para não sobrecarregar
    if (i + batchSize < clientes.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return usinasPorCliente;
};

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<(Cliente & { tickets?: number; tags?: Tag[]; usinasIntegracao?: UsinaIntegracao[] })[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [filtro, setFiltro] = useState<string>("todos");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingUsinas, setLoadingUsinas] = useState<boolean>(false);
  const navigate = useNavigate();

  // Buscar clientes + tickets + tags + usinas
  useEffect(() => {
    const fetchClientes = async () => {
      const clientesCacheKey = "@sansol/clientes/base";
      const ticketsCacheKey = "@sansol/tickets/base";

      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // =================================================
        // 👉 1. CLIENTES (CACHE)
        // =================================================
        let clientes: Cliente[] = getCache<Cliente[]>(clientesCacheKey) ?? [];

        if (clientes.length === 0) {
          const response = await fetch(
            "https://backend.sansolenergiasolar.com.br/api/v1/jclientes/",
            { headers }
          );

          if (!response.ok) {
            if (response.status === 401) {
              localStorage.clear();
              navigate("/login");
              return;
            }
            throw new Error("Erro ao buscar clientes");
          }

          clientes = await response.json();
          setCache(clientesCacheKey, clientes);
        }

        // =================================================
        // 👉 2. TICKETS (CACHE)
        // =================================================
        let ticketsRaw: TicketRaw[] =
          getCache<TicketRaw[]>(ticketsCacheKey) ?? [];

        if (ticketsRaw.length === 0) {
          const respTickets = await fetch(
            "https://backend.sansolenergiasolar.com.br/api/v1/tickets/",
            { headers }
          );

          if (!respTickets.ok) {
            if (respTickets.status === 401) {
              localStorage.clear();
              navigate("/login");
              return;
            }
            throw new Error("Erro ao buscar tickets");
          }

          ticketsRaw = await respTickets.json();
          setCache(ticketsCacheKey, ticketsRaw);
        }

        const ticketsPorCliente: Record<number, number> = {};

        ticketsRaw.forEach((t) => {
          if (!t.cliente_id) return;
          ticketsPorCliente[t.cliente_id] =
            (ticketsPorCliente[t.cliente_id] || 0) + 1;
        });

        const clientesComTickets = clientes.map((c) => ({
          ...c,
          tickets: ticketsPorCliente[c.id] || 0,
        }));

        // =================================================
        // 👉 3. FILTROS
        // =================================================
        let filtrados = clientesComTickets;

        if (filtro === "semUsinas") {
          filtrados = filtrados.filter((c) => !c.usinas || (Array.isArray(c.usinas) && c.usinas.length === 0));
        }

        if (filtro === "recentes") {
          filtrados = filtrados.slice(-50);
        }

        // =================================================
        // 👉 4. TAGS (CACHE POR CLIENTE)
        // =================================================
        const clientesComTags = await Promise.all(
          filtrados.map(async (cliente) => {
            const tagCacheKey = `@sansol/tags/cliente/${cliente.id}`;

            let tags: Tag[] = getCache<Tag[]>(tagCacheKey) ?? [];

            if (tags.length === 0) {
              try {
                const resp = await fetch(
                  `https://backend.sansolenergiasolar.com.br/api/v1/tags/entity/cliente/${cliente.id}`,
                  { headers }
                );

                if (resp.status === 401) {
                  localStorage.clear();
                  navigate("/login");
                  return { ...cliente, tags: [] };
                }

                tags = resp.ok ? await resp.json() : [];
                setCache(tagCacheKey, tags);
              } catch {
                tags = [];
              }
            }

            return { ...cliente, tags };
          })
        );

        setClientes(clientesComTags);

        // =================================================
        // 👉 5. USINAS (busca em segundo plano)
        // =================================================
        setLoadingUsinas(true);
        try {
          const usinasPorCliente = await fetchUsinasEmLote(clientesComTags, token, navigate);
          
          // Atualiza os clientes com as usinas de integração
          setClientes(prev => 
            prev.map(cliente => ({
              ...cliente,
              usinasIntegracao: usinasPorCliente[cliente.id] || []
            }))
          );
        } catch (error) {
          console.error("Erro ao buscar usinas:", error);
        } finally {
          setLoadingUsinas(false);
        }

      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [filtro, navigate]);

  // Função para contar usinas (considerando tanto as originais quanto as de integração)
  const contarUsinas = (cliente: Cliente & { usinasIntegracao?: UsinaIntegracao[] }) => {
    const usinasOriginais = Array.isArray(cliente.usinas) ? cliente.usinas.length : 0;
    const usinasIntegracao = cliente.usinasIntegracao?.length || 0;
    return usinasOriginais + usinasIntegracao;
  };

  // Deletar cliente
  const deleteCliente = async (id: number) => {
    if (!confirm("Deseja realmente excluir este cliente?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://backend.sansolenergiasolar.com.br/api/v1/jclientes/${id}`,
        { 
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          } 
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro ao excluir cliente");
      }

      alert("Cliente excluído com sucesso!");
      setClientes((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Erro inesperado ao excluir cliente");
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Cabeçalho da Página */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1F2937",
            margin: 0,
            letterSpacing: "-0.5px"
          }}>
            Clientes
          </h1>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "14px",
            color: "#6B7280",
            background: "#F9FAFB",
            padding: "8px 16px",
            borderRadius: "12px",
            border: "1px solid #E5E7EB"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#059669"
              }} />
              <span>Total: {clientes.length}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#DC2626"
              }} />
              <span>Sem usinas: {clientes.filter(c => contarUsinas(c) === 0).length}</span>
            </div>
            {loadingUsinas && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#FF7A2D"
              }}>
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #FFE4D6",
                  borderTopColor: "#FF7A2D",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                <span>Buscando usinas...</span>
              </div>
            )}
          </div>
        </div>
        <p style={{
          fontSize: "15px",
          color: "#6B7280",
          margin: 0,
          maxWidth: "600px",
          lineHeight: "1.5"
        }}>
          Gerencie todos os clientes do sistema, visualize informações detalhadas e atribua tags para melhor organização.
        </p>
      </div>

      {/* Painel de Controle */}
      <div style={{
        marginBottom: "24px",
        padding: "20px",
        background: "white",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div>
            <h3 style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              margin: "0 0 12px 0"
            }}>
              Filtros
            </h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Button
                variant="neutral"
                onClick={() => setFiltro("todos")}
                size="sm"
                style={{
                  padding: "8px 16px",
                  fontWeight: "500",
                  backgroundColor: filtro === "todos" ? "#F3F4F6" : undefined,
                  borderColor: filtro === "todos" ? "#D1D5DB" : undefined
                }}
              >
                Todos os Clientes
              </Button>
              <Button
                variant="neutral"
                onClick={() => setFiltro("semUsinas")}
                size="sm"
                style={{
                  padding: "8px 16px",
                  fontWeight: "500",
                  backgroundColor: filtro === "semUsinas" ? "#F3F4F6" : undefined,
                  borderColor: filtro === "semUsinas" ? "#D1D5DB" : undefined
                }}
              >
                Sem Usinas
              </Button>
              <Button
                variant="neutral"
                onClick={() => setFiltro("recentes")}
                size="sm"
                style={{
                  padding: "8px 16px",
                  fontWeight: "500",
                  backgroundColor: filtro === "recentes" ? "#F3F4F6" : undefined,
                  borderColor: filtro === "recentes" ? "#D1D5DB" : undefined
                }}
              >
                Mais Recentes
              </Button>
            </div>
          </div>

          <Button
            onClick={() => setModalOpen(true)}
            variant="primary"
            style={{
              padding: "10px 20px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            Adicionar Cliente
          </Button>
        </div>
      </div>

      {/* Estado de Carregamento */}
      {loading && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          background: "white",
          borderRadius: "12px",
          border: "1px solid #E5E7EB"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "3px solid #F3F4F6",
            borderTopColor: "#FF7A2D",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px"
          }} />
          <p style={{
            margin: "0 0 8px 0",
            fontSize: "16px",
            fontWeight: "600",
            color: "#1F2937"
          }}>
            Carregando clientes...
          </p>
          <p style={{
            margin: 0,
            fontSize: "14px",
            color: "#6B7280",
            textAlign: "center",
            maxWidth: "300px"
          }}>
            Buscando informações dos clientes no servidor
          </p>
        </div>
      )}

      {/* Tabela de Clientes */}
      {!loading && (
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
              <h3 style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "600",
                color: "#1F2937"
              }}>
                Lista de Clientes
              </h3>
              {loadingUsinas && (
                <div style={{
                  fontSize: "14px",
                  color: "#6B7280",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <div style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #E5E7EB",
                    borderTopColor: "#FF7A2D",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }} />
                  Atualizando usinas...
                </div>
              )}
            </div>
          </div>

          <div style={{ minHeight: "400px" }}>
            <Table
              data={clientes}
              columns={["nome_completo", "telefone", "usinas", "tickets", "ações"]}
              page={page}
              pageSize={10}
              onPageChange={setPage}
              onCellClick={(row, column) => {
                if (column === "nome_completo") setSelectedCliente(row);
              }}
              renderCell={(row, column) => {
                if (column === "ações") {
                  return (
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      {/* EDITAR */}
                      <Button
                        variant="edit"
                        icon
                        onClick={() => setSelectedCliente(row)}
                        style={{
                          padding: "8px",
                          borderRadius: "8px",
                          transition: "all 0.2s"
                        }}
                      />

                      {/* DELETAR */}
                      <Button
                        variant="delete"
                        icon
                        onClick={() => deleteCliente(row.id)}
                        style={{
                          padding: "8px",
                          borderRadius: "8px",
                          transition: "all 0.2s"
                        }}
                      />
                    </div>
                  );
                }

                // === RENDERIZAÇÃO DO NOME + TAGS ===
                if (column === "nome_completo") {
                  return (
                    <NomeClienteCell
                      row={row}
                      onClienteClick={setSelectedCliente}
                    />
                  );
                }

                // === RENDERIZAÇÃO TELEFONE ===
                if (column === "telefone") {
                  return (
                    <div style={{
                      color: "#374151",
                      fontWeight: "500",
                      fontSize: "14px",
                      padding: "8px 0"
                    }}>
                      {row.telefone || (
                        <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>
                          Não informado
                        </span>
                      )}
                    </div>
                  );
                }

                // === RENDERIZAÇÃO USINAS (APENAS QUANTIDADE) ===
                if (column === "usinas") {
                  const totalUsinas = contarUsinas(row);

                  if (totalUsinas > 0) {
                    return (
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        background: "#EFF6FF",
                        borderRadius: "20px",
                        fontWeight: "600",
                        fontSize: "13px",
                        color: "#1E40AF"
                      }}>
                        <div style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#3B82F6"
                        }} />
                        {totalUsinas} usina{totalUsinas !== 1 ? 's' : ''}
                      </div>
                    );
                  }

                  return (
                    <span style={{
                      color: "#DC2626",
                      fontWeight: "500",
                      fontSize: "13px",
                      padding: "4px 10px",
                      background: "#FEF2F2",
                      borderRadius: "6px",
                      display: "inline-block"
                    }}>
                      Sem usinas
                    </span>
                  );
                }

                // === RENDERIZAÇÃO TICKETS ===
                if (column === "tickets") {
                  const ticketCount = row.tickets ?? 0;
                  return (
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 12px",
                      background: ticketCount > 0 ? "#FEF3C7" : "#F3F4F6",
                      borderRadius: "20px",
                      fontWeight: "600",
                      fontSize: "13px",
                      color: ticketCount > 0 ? "#92400E" : "#6B7280"
                    }}>
                      <div style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: ticketCount > 0 ? "#F59E0B" : "#9CA3AF"
                      }} />
                      {ticketCount} ticket{ticketCount !== 1 ? 's' : ''}
                    </div>
                  );
                }

                // Para outras colunas, verifica se é array ou valor simples
                const value = row[column as keyof Cliente];
                if (Array.isArray(value)) {
                  return <span>{value.length} item(ns)</span>;
                }
                
                // Garantir que retornamos um tipo válido para o React
                return value !== null && value !== undefined ? String(value) : null;
              }}
            />
          </div>
        </div>
      )}

      {/* Modais */}
      {modalOpen && <ModalAdicionarCliente onClose={() => setModalOpen(false)} />}

      {selectedCliente && (
        <ModalCliente
          cliente={selectedCliente}
          onClose={() => setSelectedCliente(null)}
        />
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Clientes;