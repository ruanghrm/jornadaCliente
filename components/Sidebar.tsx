// src/components/Sidebar.tsx
import React, { useState } from "react";
import {
  FaChartPie,
  //FaFileInvoice,
  FaChartLine,
  FaDollarSign,
  FaBuilding,
  FaUsers,
  FaTicketAlt,
  FaKey,
  FaComments,
  FaGlobe,
  FaCogs,
  FaLightbulb,
  FaLifeRing,
} from "react-icons/fa";

interface SidebarProps {
  setActivePage: (page: string) => void;
  activePage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ setActivePage, activePage }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: <FaChartPie />, label: "Dashboard", page: "dashboard" },
    //{ icon: <FaFileInvoice />, label: "Faturas", page: "faturas" },
    { icon: <FaChartLine />, label: "Relatórios", page: "relatorios" },
    { icon: <FaDollarSign />, label: "Financeiro", page: "financeiro" },
    { icon: <FaBuilding />, label: "Usinas", page: "unidades" },
    { icon: <FaUsers />, label: "Clientes", page: "clientes" },
    { icon: <FaTicketAlt />, label: "Tickets", page: "tickets" },
    { icon: <FaKey />, label: "Assinatura", page: "assinatura" },
    { icon: <FaComments />, label: "Mensagens automáticas", page: "mensagens" },
    { icon: <FaGlobe />, label: "Portais", page: "portais" },
    { icon: <FaLightbulb />, label: "Oportunidades", page: "oportunidades" },
    { icon: <FaCogs />, label: "Configurações", page: "configuracoes" },
    { icon: <FaLifeRing />, label: "Suporte", page: "suporte" },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside
      style={{
        width: collapsed ? "80px" : "230px",
        background: "#fff",
        color: "#ff7a2d",
        height: "100vh",
        transition: "width 0.3s ease",
        boxShadow: "2px 0 6px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Top section with logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "3px 0" : "15px 20px",
          borderBottom: "1px solid #eee",
          minHeight: "70px",
          cursor: "pointer",
          width: "100%",
        }}
        onClick={toggleSidebar}
      >
        {!collapsed ? (
          // Logo expandida - VERSÃO HORIZONTAL (maior)
          <div style={{ 
            display: "flex", 
            alignItems: "center",
            width: "100%",
            overflow: "hidden",
          }}>
            <img
              src="/src/assets/logotipo-sansol-horizontal-oficial-1024x299-_1_.png"
              alt="Sansol Energia Solar"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "45px",
                objectFit: "contain",
                objectPosition: "left",
              }}
              onError={(e) => {
                console.log("Imagem horizontal não encontrada, usando fallback");
                e.currentTarget.style.display = 'none';
                // Fallback com texto
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('span');
                  fallback.textContent = 'Sansol';
                  fallback.style.fontSize = '1.3rem';
                  fallback.style.fontWeight = 'bold';
                  fallback.style.color = '#ff7a2d';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        ) : (
          // Logo colapsada - VERSÃO ÍCONE (menor)
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
            width: "100%" 
          }}>
            <img
              src="/src/assets/logotipo-sansol-3-150x150.png"
              alt="S"
              style={{
                width: "40px",
                height: "40px",
                objectFit: "contain",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onError={(e) => {
                console.log("Imagem ícone não encontrada, usando fallback");
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('span');
                  fallback.textContent = 'S';
                  fallback.style.fontSize = '1.5rem';
                  fallback.style.fontWeight = 'bold';
                  fallback.style.color = '#ff7a2d';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Menu items */}
      <nav style={{ flex: 1, overflowY: "auto" }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {menuItems.map((item, idx) => {
            const isActive = item.page === activePage;

            return (
              <li
                key={idx}
                onClick={() => setActivePage(item.page)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? "0" : "12px",
                  padding: "12px 20px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  justifyContent: collapsed ? "center" : "flex-start",
                  fontSize: "0.95rem",
                  backgroundColor: isActive ? "#ff7a2d" : "transparent",
                  color: isActive ? "#fff" : "#ff7a2d",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,122,45,0.1)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span style={{ fontSize: "1.1rem", color: isActive ? "#fff" : undefined }}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer section */}
      <div
        style={{
          textAlign: "center",
          padding: "15px",
          borderTop: "1px solid #eee",
          fontSize: "0.8rem",
          color: "#bbb",
        }}
      >
        {collapsed ? "©" : "© 2025 Sansol"}
      </div>
    </aside>
  );
};

export default Sidebar;