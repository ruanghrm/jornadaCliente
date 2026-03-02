import React from "react";
import type { TabNavigationProps } from "./types";

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "informacoes" as const, label: "Informações" },
    { id: "documentos" as const, label: "Documentos" },
    { id: "contratos" as const, label: "Contratos" },
    { id: "usinas" as const, label: "Usinas" }, // ✅ NOVA ABA
  ];

  return (
    <div style={{
      display: "flex",
      borderBottom: "1px solid #f3f4f6",
      padding: "0 28px",
      background: "#f9fafb",
      overflowX: "auto" // Para mobile
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: "16px 24px",
            background: activeTab === tab.id ? "#ffffff" : "transparent",
            border: "none",
            borderBottom: activeTab === tab.id ? "3px solid #FF7A2D" : "3px solid transparent",
            color: activeTab === tab.id ? "#1f2937" : "#6b7280",
            fontWeight: activeTab === tab.id ? "600" : "500",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
            position: "relative",
            bottom: "-1px",
            whiteSpace: "nowrap"
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};