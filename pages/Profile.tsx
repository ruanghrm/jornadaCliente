import React, { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  Calendar,
  RefreshCw,
  Shield,
  Bell,
  Clock,
  Star,
  Award,
  Activity,
  LogOut
} from "lucide-react";
import Button from "../components/Button";

interface UsuarioMe {
  id: number;
  nome: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  telefone?: string;
  departamento?: string;
  ultimo_acesso?: string;
}

const Profile: React.FC = () => {
  const [usuario, setUsuario] = useState<UsuarioMe | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado");

        const response = await fetch(
          "https://backend.sansolenergiasolar.com.br/api/v1/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar perfil");
        }

        const data = await response.json();
        setUsuario(data);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, []);

  const formatarData = (data: string) => {
    try {
      const date = new Date(data);
      const agora = new Date();
      const diferencaMs = agora.getTime() - date.getTime();
      const diferencaDias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
      
      if (diferencaDias === 0) {
        const horas = Math.floor(diferencaMs / (1000 * 60 * 60));
        if (horas === 0) {
          const minutos = Math.floor(diferencaMs / (1000 * 60));
          return `Há ${minutos} min`;
        }
        return `Há ${horas} h`;
      }
      if (diferencaDias === 1) return "Ontem";
      if (diferencaDias < 7) return `Há ${diferencaDias} dias`;
      
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return data;
    }
  };

  const getRoleColor = (role: string) => {
    const roles: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
      admin: { 
        bg: "linear-gradient(135deg, #FF7A2D, #FF9A3D)", 
        color: "#ffffff",
        icon: <Shield size={16} />
      },
      tecnico: { 
        bg: "linear-gradient(135deg, #FF7A2D, #FF9A3D)", 
        color: "#ffffff",
        icon: <Briefcase size={16} />
      },
      telemarketing: { 
        bg: "linear-gradient(135deg, #FF7A2D, #FF9A3D)", 
        color: "#ffffff",
        icon: <Bell size={16} />
      },
      supervisor: { 
        bg: "linear-gradient(135deg, #FF7A2D, #FF9A3D)", 
        color: "#ffffff",
        icon: <Award size={16} />
      }
    };
    
    return roles[role] || { 
      bg: "linear-gradient(135deg, #FF7A2D, #FF9A3D)", 
      color: "#ffffff",
      icon: <User size={16} />
    };
  };

  const getStatusInfo = (status: string) => {
    if (status === "ativo") {
      return {
        icon: <CheckCircle size={16} />,
        bg: "#10b98120",
        color: "#10b981",
        text: "Ativo"
      };
    }
    return {
      icon: <XCircle size={16} />,
      bg: "#ef444420",
      color: "#ef4444",
      text: "Inativo"
    };
  };

  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair da sua conta?")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  if (carregando) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px" 
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "60px",
            height: "60px",
            border: "4px solid #e2e8f0",
            borderTopColor: "#FF7A2D",
            borderRadius: "50%",
            margin: "0 auto 20px",
            animation: "spin 1s linear infinite"
          }} />
          <h3 style={{ color: "#64748b", margin: 0 }}>Carregando perfil...</h3>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "60px 20px" 
      }}>
        <XCircle size={64} color="#ef4444" style={{ marginBottom: "20px" }} />
        <h3 style={{ color: "#1e293b", marginBottom: "12px" }}>Erro ao carregar perfil</h3>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          Não foi possível carregar os dados do seu perfil.
        </p>
        <Button 
          variant="primary"
          onClick={() => window.location.reload()}
          style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 auto" }}
        >
          <RefreshCw size={16} />
          Tentar novamente
        </Button>
      </div>
    );
  }

  const roleInfo = getRoleColor(usuario.role);
  const statusInfo = getStatusInfo(usuario.status);

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .profile-card {
          transition: all 0.3s ease;
        }
        
        .profile-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255, 122, 45, 0.1);
        }
        
        .info-item {
          transition: all 0.2s ease;
        }
        
        .info-item:hover {
          background: #FFF7F2;
          border-color: #FFE4D6;
        }
        
        .avatar-pulse {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 122, 45, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 122, 45, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 122, 45, 0); }
        }
      `}</style>
      
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
        {/* Header com avatar e informações principais */}
        <div
          style={{
            background: "linear-gradient(135deg, #FF7A2D, #FF9A3D)",
            borderRadius: "24px",
            padding: "40px",
            marginBottom: "32px",
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(255, 122, 45, 0.3)",
          }}
        >
          <div style={{ 
            position: "absolute", 
            top: "-100px", 
            right: "-100px", 
            width: "300px", 
            height: "300px", 
            background: "rgba(255,255,255,0.1)", 
            borderRadius: "50%" 
          }} />
          <div style={{ 
            position: "absolute", 
            bottom: "-50px", 
            left: "-50px", 
            width: "200px", 
            height: "200px", 
            background: "rgba(255,255,255,0.05)", 
            borderRadius: "50%" 
          }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: "24px", position: "relative", zIndex: 1 }}>
            <div 
              className="avatar-pulse"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "48px",
                fontWeight: "bold",
                backdropFilter: "blur(10px)",
                border: "4px solid rgba(255,255,255,0.3)",
              }}
            >
              {usuario.nome.charAt(0).toUpperCase()}
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                margin: "0 0 8px", 
                fontSize: "2rem", 
                fontWeight: "700",
                color: "white",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}>
                {usuario.nome}
              </h1>
              
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  background: "rgba(255,255,255,0.2)",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  backdropFilter: "blur(10px)",
                }}>
                  {roleInfo.icon}
                  <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                    {usuario.role.charAt(0).toUpperCase() + usuario.role.slice(1)}
                  </span>
                </div>
                
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  background: statusInfo.bg,
                  padding: "8px 16px",
                  borderRadius: "20px",
                  color: statusInfo.color,
                  backdropFilter: "blur(10px)",
                }}>
                  {statusInfo.icon}
                  <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                    {statusInfo.text}
                  </span>
                </div>
              </div>
              
              <p style={{ 
                margin: 0, 
                fontSize: "1rem", 
                opacity: 0.9,
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <Mail size={18} />
                {usuario.email}
              </p>
            </div>
          </div>
        </div>
        
        {/* Grid de informações */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {/* Informações Pessoais */}
          <div className="profile-card" style={{
            background: "white",
            padding: "32px",
            borderRadius: "20px",
            border: "1px solid #FFE4D6",
            boxShadow: "0 4px 20px rgba(255, 122, 45, 0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #FF7A2D20, #FF9A3D20)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FF7A2D",
              }}>
                <User size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600", color: "#1e293b" }}>
                Informações Pessoais
              </h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="info-item" style={infoItemStyle}>
                <div style={infoLabelStyle}>
                  <Mail size={16} color="#FF7A2D" />
                  <span>E-mail</span>
                </div>
                <span style={{ fontWeight: "500", color: "#1e293b" }}>{usuario.email}</span>
              </div>
              
              {usuario.telefone && (
                <div className="info-item" style={infoItemStyle}>
                  <div style={infoLabelStyle}>
                    <Bell size={16} color="#FF7A2D" />
                    <span>Telefone</span>
                  </div>
                  <span style={{ fontWeight: "500", color: "#1e293b" }}>{usuario.telefone}</span>
                </div>
              )}
              
              {usuario.departamento && (
                <div className="info-item" style={infoItemStyle}>
                  <div style={infoLabelStyle}>
                    <Briefcase size={16} color="#FF7A2D" />
                    <span>Departamento</span>
                  </div>
                  <span style={{ fontWeight: "500", color: "#1e293b" }}>{usuario.departamento}</span>
                </div>
              )}
              
              <div className="info-item" style={infoItemStyle}>
                <div style={infoLabelStyle}>
                  <Star size={16} color="#FF7A2D" />
                  <span>ID do Usuário</span>
                </div>
                <span style={{ 
                  fontFamily: "monospace", 
                  fontWeight: "600", 
                  color: "#FF7A2D",
                  background: "#FFF7F2",
                  padding: "4px 12px",
                  borderRadius: "8px",
                  fontSize: "0.9rem"
                }}>
                  #{usuario.id.toString().padStart(6, '0')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Atividade */}
          <div className="profile-card" style={{
            background: "white",
            padding: "32px",
            borderRadius: "20px",
            border: "1px solid #FFE4D6",
            boxShadow: "0 4px 20px rgba(255, 122, 45, 0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #FF7A2D20, #FF9A3D20)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FF7A2D",
              }}>
                <Activity size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600", color: "#1e293b" }}>
                Atividade da Conta
              </h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="info-item" style={infoItemStyle}>
                <div style={infoLabelStyle}>
                  <Calendar size={16} color="#FF7A2D" />
                  <span>Conta criada</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <span style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.95rem" }}>
                    {formatarData(usuario.createdAt)}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {new Date(usuario.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="info-item" style={infoItemStyle}>
                <div style={infoLabelStyle}>
                  <RefreshCw size={16} color="#FF7A2D" />
                  <span>Última atualização</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <span style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.95rem" }}>
                    {formatarData(usuario.updatedAt)}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    {new Date(usuario.updatedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              {usuario.ultimo_acesso && (
                <div className="info-item" style={infoItemStyle}>
                  <div style={infoLabelStyle}>
                    <Clock size={16} color="#FF7A2D" />
                    <span>Último acesso</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <span style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.95rem" }}>
                      {formatarData(usuario.ultimo_acesso)}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {new Date(usuario.ultimo_acesso).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Botão de Logout */}
        <div className="profile-card" style={{
          background: "white",
          padding: "32px",
          borderRadius: "20px",
          border: "1px solid #FFE4D6",
          marginTop: "32px",
          boxShadow: "0 4px 20px rgba(255, 122, 45, 0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #FF7A2D20, #FF9A3D20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FF7A2D",
            }}>
              <LogOut size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600", color: "#1e293b" }}>
              Segurança da Conta
            </h3>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>
              Para proteger sua conta, certifique-se de sair ao terminar de usar o sistema.
            </p>
            
            <Button
              variant="neutral"
              onClick={handleLogout}
              style={{ 
                padding: "12px 32px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "0 auto",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                border: "none",
                fontWeight: "600",
                fontSize: "1rem"
              }}
            >
              Sair da Conta
            </Button>
            
            <p style={{ 
              fontSize: "0.85rem", 
              color: "#94a3b8", 
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}>
              <Shield size={14} />
              Sua sessão será encerrada imediatamente
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const infoItemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #FFE4D6",
  background: "#ffffff",
};

const infoLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "0.9rem",
  color: "#1e293b",
  fontWeight: "500",
};

export default Profile;