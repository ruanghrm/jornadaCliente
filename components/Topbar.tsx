// src/components/Topbar.tsx
import React, { useEffect, useState } from "react";
import { FaSearch, FaBell, FaCaretDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


interface UsuarioMe {
  id: number;
  nome: string;
  email: string;
  role: string;
  status: string;
}

interface Notificacao {
  id: number;
  user_id: number;
  titulo: string;
  mensagem: string;
  origem_tipo: string;
  origem_id: number;
}

interface TopbarProps {
  setActivePage: (page: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ setActivePage }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioMe | null>(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregandoNotificacoes, setCarregandoNotificacoes] = useState(false);
  const navigate = useNavigate();

  // ============================================================
  // 🔹 Buscar usuário logado
  // ============================================================
  useEffect(() => {
    const carregarUsuario = async () => {
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

        if (response.status === 401) {
          handleLogout();
          return;
        }

        if (!response.ok) {
          throw new Error("Erro ao buscar usuário");
        }

        const data = await response.json();
        setUsuario(data);
      } catch (error) {
        console.error("Erro ao carregar usuário logado:", error);
        handleLogout();
      } finally {
        setCarregandoUsuario(false);
      }
    };

    carregarUsuario();
  }, []);

  useEffect(() => {
  const carregarNotificacoes = async () => {
    if (!usuario?.id) return;

    try {
      setCarregandoNotificacoes(true);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      const response = await fetch(
        `https://backend.sansolenergiasolar.com.br/api/v1/notificacoes/${usuario.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao buscar notificações");
      }

      const data = await response.json();
      setNotificacoes(data);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setCarregandoNotificacoes(false);
    }
  };

  carregarNotificacoes();
}, [usuario?.id]);
  // ============================================================
  // 🔹 Logout
  // ============================================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); // rota correta do Login
  };


  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu((prev) => !prev);
    setShowNotifications(false);
  };

  const inicialNome = usuario?.nome?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      {/* === TOPBAR FIXA === */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          padding: "10px 20px",
          borderBottom: "1px solid #eee",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        {/* ==== Busca ==== */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f9f9f9",
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid #eee",
            }}
          >
            <FaSearch color="#ff7a2d" />
            <input
              type="search"
              placeholder="Buscar..."
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                marginLeft: "6px",
                color: "#333",
              }}
            />
          </div>
        </div>

        {/* ==== Notificações + Usuário ==== */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            position: "relative",
          }}
        >
          {/* 🔔 Notificações */}
          <button
            onClick={toggleNotifications}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#ff7a2d",
              position: "relative",
              fontSize: "18px",
            }}
          >
            <FaBell />
            {notificacoes.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: 0,
                right: -5,
                background: "#ff7a2d",
                color: "#fff",
                fontSize: "10px",
                borderRadius: "50%",
                padding: "2px 6px",
              }}
            >
              {notificacoes.length}
            </span>
          )}
          </button>

          {/* 👤 Usuário */}
          <div style={{ position: "relative" }}>
            <button
              onClick={toggleUserMenu}
              disabled={carregandoUsuario}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                cursor: "pointer",
                opacity: carregandoUsuario ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "#ff7a2d",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {inicialNome}
              </div>

              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#ff7a2d", fontWeight: 600 }}>
                  {usuario?.nome ?? "Carregando..."}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    textTransform: "capitalize",
                  }}
                >
                  {usuario?.role}
                </div>
              </div>

              <FaCaretDown color="#ff7a2d" />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <ul
                style={{
                  position: "absolute",
                  right: 0,
                  top: "48px",
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  listStyle: "none",
                  padding: "8px 0",
                  margin: 0,
                  width: "200px",
                  zIndex: 1001,
                }}
              >
                <li
  style={menuItemStyle}
  onClick={() => {
    setActivePage("profile");
    setShowUserMenu(false);
  }}
>
  Ver perfil
</li>

<li
  style={menuItemStyle}
  onClick={() => {
    setActivePage("configuracoes");
    setShowUserMenu(false);
  }}
>
  Configurações
</li>
                <li
                  style={{ ...menuItemStyle, color: "#ef4444" }}
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* === MODAL DE NOTIFICAÇÕES === */}
      {showNotifications && (
  <div
    onClick={() => setShowNotifications(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "#fff",
        borderRadius: "12px",
        width: "400px",
        maxHeight: "70vh",
        overflowY: "auto",
        padding: "20px",
      }}
    >
      <h3 style={{ color: "#ff7a2d", marginBottom: "10px" }}>
        Notificações
      </h3>

      {carregandoNotificacoes ? (
        <p style={{ color: "#64748b" }}>
          Carregando notificações...
        </p>
      ) : notificacoes.length === 0 ? (
        <p style={{ color: "#64748b" }}>
          Você não possui notificações 🎉
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {notificacoes.map((notificacao) => (
            <li
              key={notificacao.id}
              style={{
                padding: "12px",
                borderBottom: "1px solid #eee",
              }}
            >
              <strong style={{ color: "#ff7a2d" }}>
                {notificacao.titulo}
              </strong>
              <p
                style={{
                  margin: "4px 0 0",
                  color: "#333",
                  fontSize: "0.9rem",
                }}
              >
                {notificacao.mensagem}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)}
    </>
  );
};

const menuItemStyle: React.CSSProperties = {
  padding: "10px 15px",
  cursor: "pointer",
  color: "#ff7a2d",
};

export default Topbar;