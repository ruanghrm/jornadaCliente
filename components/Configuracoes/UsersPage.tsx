import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Search, 
  Shield, 
  Mail, 
  User as UserIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const UsersPage: React.FC = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  const ROLES = [
    { value: "all", label: "Todos os Perfis", color: "#6b7280" },
    { value: "admin", label: "Administrador", color: "#FF7A2D" },
    { value: "tecnico", label: "Técnico", color: "#0ea5e9" },
    { value: "telemarketing", label: "Telemarketing", color: "#10b981" },
    { value: "supervisor", label: "Supervisor", color: "#8b5cf6" }
  ];

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
          navigate("/login");
          return;
        }

        const currentUser: User = JSON.parse(storedUser);

        if (currentUser.role !== "admin") {
          alert("Você não tem permissão para acessar esta página.");
          navigate("/");
          return;
        }

        const resp = await fetch(
          "https://backend.sansolenergiasolar.com.br/api/v1/auth/usuarios?limit=1000",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!resp.ok) {
          if (resp.status === 401) {
            localStorage.clear();
            navigate("/login");
            return;
          }
          throw new Error("Erro ao buscar usuários");
        }

        const data = await resp.json();
        setUsers(data.items || []);
        setFilteredUsers(data.items || []);
      } catch (err: unknown) {
        console.error("Erro ao carregar usuários:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erro inesperado ao carregar usuários.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [navigate]);

  // Filtragem e busca
  useEffect(() => {
    let filtered = [...users];

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por role
    if (selectedRole !== "all") {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset para primeira página
  }, [searchTerm, selectedRole, users]);

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getRoleColor = (role: string) => {
    const roleMap: Record<string, { bg: string; color: string; }> = {
      admin: { 
        bg: "#FF7A2D20", 
        color: "#FF7A2D"
      },
      tecnico: { 
        bg: "#0ea5e920", 
        color: "#0ea5e9"
      },
      telemarketing: { 
        bg: "#10b98120", 
        color: "#10b981"
      },
      supervisor: { 
        bg: "#8b5cf620", 
        color: "#8b5cf6"
      }
    };
    
    return roleMap[role] || { 
      bg: "#6b728020", 
      color: "#6b7280"
    };
  };

  const getStatusInfo = (status?: string) => {
    if (!status) return null;
    
    if (status === "ativo") {
      return {
        icon: <CheckCircle size={14} />,
        bg: "#10b98120",
        color: "#10b981",
        text: "Ativo"
      };
    }
    return {
      icon: <XCircle size={14} />,
      bg: "#ef444420",
      color: "#ef4444",
      text: "Inativo"
    };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Estilos CSS
  const styles = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .user-row {
      transition: all 0.2s ease;
    }
    
    .user-row:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 122, 45, 0.1);
      background: #FFF7F2 !important;
    }
    
    .role-badge {
      transition: all 0.2s ease;
    }
    
    .role-badge:hover {
      transform: scale(1.05);
    }
    
    .pagination-btn {
      transition: all 0.2s ease;
    }
    
    .pagination-btn:hover:not(:disabled) {
      background: #FF7A2D10 !important;
      border-color: #FF7A2D !important;
    }
  `;

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "300px" 
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid #e2e8f0",
            borderTopColor: "#FF7A2D",
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 1s linear infinite"
          }} />
          <h3 style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>Carregando usuários...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "40px 20px" 
      }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: "16px" }} />
        <h3 style={{ color: "#1e293b", marginBottom: "8px", fontSize: "1rem" }}>Erro ao carregar usuários</h3>
        <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "0.9rem" }}>
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "8px 16px",
            background: "#FF7A2D",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "0.9rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div style={{ padding: "0" }}>
        {/* Header mais compacto */}
        <div style={{
          background: "linear-gradient(135deg, #FF7A2D, #FF9A3D)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          color: "white",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(255, 122, 45, 0.2)",
        }}>
          <div style={{ 
            position: "absolute", 
            top: "-30px", 
            right: "-30px", 
            width: "120px", 
            height: "120px", 
            background: "rgba(255,255,255,0.1)", 
            borderRadius: "50%" 
          }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative", zIndex: 1 }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
            }}>
              <Users size={20} />
            </div>
            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: "1.25rem", 
                fontWeight: "600",
                color: "white"
              }}>
                Gerenciar Usuários
              </h2>
              <p style={{ 
                margin: "4px 0 0", 
                fontSize: "0.85rem", 
                opacity: 0.9,
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <Shield size={14} />
                Gerencie todos os usuários do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Filtros e Busca - Versão mais compacta */}
        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #FFE4D6",
          marginBottom: "16px",
          boxShadow: "0 2px 8px rgba(255, 122, 45, 0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            {/* Busca */}
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={18} style={{ 
                position: "absolute", 
                left: "12px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: "#94a3b8" 
              }} />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "95%",
                  padding: "10px 10px 10px 38px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.9rem",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF7A2D";
                  e.target.style.boxShadow = "0 0 0 2px rgba(255, 122, 45, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Filtro de Perfil */}
            <div style={{ minWidth: "180px" }}>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "0.9rem",
                  background: "white",
                  color: "#1e293b",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "36px"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF7A2D";
                  e.target.style.boxShadow = "0 0 0 2px rgba(255, 122, 45, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estatísticas - Versão mais compacta */}
          <div style={{ 
            display: "flex", 
            gap: "12px", 
            flexWrap: "wrap" 
          }}>
            <div style={{ 
              padding: "10px 14px", 
              background: "#FF7A2D10", 
              borderRadius: "8px", 
              border: "1px solid #FFE4D6",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "140px"
            }}>
              <Users size={14} color="#FF7A2D" />
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Total de Usuários</div>
                <div style={{ fontSize: "1rem", fontWeight: "600", color: "#FF7A2D" }}>
                  {users.length}
                </div>
              </div>
            </div>

            {ROLES.filter(r => r.value !== "all").map(role => {
              const count = users.filter(u => u.role === role.value).length;
              if (count === 0) return null;
              
              return (
                <div 
                  key={role.value} 
                  style={{ 
                    padding: "10px 14px", 
                    background: role.color + "10", 
                    borderRadius: "8px", 
                    border: `1px solid ${role.color}20`,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: "140px"
                  }}
                >
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "5px",
                    background: role.color + "20",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: role.color,
                  }}>
                    <UserIcon size={12} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{role.label}</div>
                    <div style={{ fontSize: "1rem", fontWeight: "600", color: role.color }}>
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabela de Usuários - Versão mais compacta */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #FFE4D6",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(255, 122, 45, 0.05)",
        }}>
          {/* Cabeçalho da Tabela */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(120px, 1.5fr) minmax(120px, 1.5fr) 120px 80px 120px",
            padding: "12px 16px",
            background: "#FFF7F2",
            borderBottom: "1px solid #FFE4D6",
            gap: "12px",
            alignItems: "center",
          }}>
            <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.85rem" }}>Nome</div>
            <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.85rem" }}>Email</div>
            <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.85rem" }}>Perfil</div>
            <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.85rem" }}>Status</div>
            <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.85rem" }}>Criado em</div>
          </div>

          {/* Lista de Usuários */}
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {currentUsers.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "40px 16px",
                color: "#64748b"
              }}>
                <Users size={36} style={{ marginBottom: "12px", opacity: 0.5 }} />
                <h4 style={{ margin: 0, marginBottom: "4px", fontSize: "0.95rem" }}>Nenhum usuário encontrado</h4>
                <p style={{ fontSize: "0.85rem" }}>Não há usuários correspondentes aos filtros selecionados.</p>
              </div>
            ) : (
              currentUsers.map((user, index) => {
                const roleInfo = getRoleColor(user.role);
                const statusInfo = getStatusInfo(user.status);
                
                return (
                  <div
                    key={user.id}
                    className="user-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(120px, 1.5fr) minmax(120px, 1.5fr) 120px 80px 120px",
                      padding: "12px 16px",
                      background: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                      borderBottom: "1px solid #f1f5f9",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FF7A2D, #FF9A3D)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "13px",
                        flexShrink: 0
                      }}>
                        {user.nome.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: "500", 
                          color: "#1e293b", 
                          fontSize: "0.9rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {user.nome}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          ID: #{user.id.toString().padStart(6, '0')}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      color: "#1e293b", 
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      minWidth: 0
                    }}>
                      <Mail size={12} color="#64748b" />
                      <span style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        {user.email}
                      </span>
                    </div>
                    
                    <div>
                      <span
                        className="role-badge"
                        style={{
                          padding: "4px 10px",
                          borderRadius: "16px",
                          background: roleInfo.bg,
                          color: roleInfo.color,
                          fontSize: "0.8rem",
                          fontWeight: "500",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                    
                    <div>
                      {statusInfo ? (
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: "16px",
                          background: statusInfo.bg,
                          color: statusInfo.color,
                          fontSize: "0.8rem",
                          fontWeight: "500",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          whiteSpace: "nowrap"
                        }}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </span>
                      ) : (
                        <span style={{ 
                          color: "#94a3b8", 
                          fontSize: "0.8rem",
                          whiteSpace: "nowrap"
                        }}>
                          Não definido
                        </span>
                      )}
                    </div>
                    
                    <div style={{ 
                      color: "#64748b", 
                      fontSize: "0.85rem",
                      whiteSpace: "nowrap"
                    }}>
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Paginação - Versão mais compacta */}
          {filteredUsers.length > itemsPerPage && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              borderTop: "1px solid #FFE4D6",
              background: "#FFF7F2",
            }}>
              <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length} usuários
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    borderRadius: "6px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    color: currentPage === 1 ? "#94a3b8" : "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.8rem"
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                
                <div style={{ display: "flex", gap: "4px" }}>
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage <= 2) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNum = totalPages - 2 + i;
                    } else {
                      pageNum = currentPage - 1 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          width: "28px",
                          height: "28px",
                          border: "1px solid",
                          borderColor: currentPage === pageNum ? "#FF7A2D" : "#e2e8f0",
                          background: currentPage === pageNum ? "#FF7A2D" : "white",
                          borderRadius: "6px",
                          color: currentPage === pageNum ? "white" : "#1e293b",
                          cursor: "pointer",
                          fontWeight: "500",
                          fontSize: "0.8rem"
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 3 && currentPage < totalPages - 1 && (
                    <>
                      <span style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        color: "#64748b",
                        fontSize: "0.8rem",
                        padding: "0 4px"
                      }}>
                        ...
                      </span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        style={{
                          width: "28px",
                          height: "28px",
                          border: "1px solid #e2e8f0",
                          background: "white",
                          borderRadius: "6px",
                          color: "#1e293b",
                          cursor: "pointer",
                          fontWeight: "500",
                          fontSize: "0.8rem"
                        }}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "6px 10px",
                    border: "1px solid #e2e8f0",
                    background: "white",
                    borderRadius: "6px",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    color: currentPage === totalPages ? "#94a3b8" : "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.8rem"
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UsersPage;