import React, { useState } from "react";
import TagsPage from "../components/Configuracoes/TagsPage";
import UsersPage from "../components/Configuracoes/UsersPage";

import {
  FiSettings,
  FiUsers,
  FiLock,
  FiTag,
  FiChevronRight,
} from "react-icons/fi";

const Configuracoes: React.FC = () => {
  const [selectedMenu, setSelectedMenu] = useState<string>("tags");

  const menuItems = [
    { key: "geral", label: "Geral", icon: <FiSettings size={18} /> },
    { key: "usuarios", label: "Usuários", icon: <FiUsers size={18} /> },
    { key: "permissoes", label: "Permissões", icon: <FiLock size={18} /> },
    { key: "tags", label: "Administrar Tags", icon: <FiTag size={18} /> },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "280px",
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          padding: "24px 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "0 24px 24px",
            borderBottom: "1px solid #e2e8f0",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div
              style={{
                width: 32,
                height: 32,
                background:
                  "linear-gradient(135deg, #f97316, #ea580c)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <FiSettings size={18} />
            </div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Configurações</h2>
          </div>
          <p style={{ margin: "8px 0 0 44px", fontSize: 13, color: "#64748b" }}>
            Gerencie as configurações do sistema
          </p>
        </div>

        {/* Menu */}
        <div style={{ padding: "0 16px" }}>
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedMenu(item.key)}
              style={{
                width: "100%",
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "none",
                background:
                  selectedMenu === item.key ? "#ffedd5" : "transparent",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {item.icon}
                {item.label}
              </div>
              {selectedMenu === item.key ? (
                <div
                  style={{
                    width: 4,
                    height: 20,
                    background: "#f97316",
                    borderRadius: 2,
                  }}
                />
              ) : (
                <FiChevronRight size={16} color="#cbd5e1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, background: "#fff", overflow: "auto" }}>
        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            padding: "24px 32px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 24 }}>
            {menuItems.find((m) => m.key === selectedMenu)?.label}
          </h1>
        </div>

        {/* Área dinâmica */}
        <div style={{ padding: 32 }}>
          {selectedMenu === "tags" && <TagsPage />}

          {selectedMenu === "usuarios" && <UsersPage />}

          {selectedMenu !== "tags" && selectedMenu !== "usuarios" && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ color: "#64748b" }}>
                Esta seção está em desenvolvimento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
