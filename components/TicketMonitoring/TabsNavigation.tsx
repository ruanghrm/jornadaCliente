// components/TabsNavigation.tsx
import React from "react";

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabsNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabsNavigation: React.FC<TabsNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div style={{
      display: "flex",
      borderBottom: "2px solid #f1f5f9",
      marginBottom: "24px",
      overflowX: "auto"
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: "12px 20px",
            background: "none",
            border: "none",
            fontSize: "14px",
            fontWeight: "600",
            color: activeTab === tab.id ? "#FF7A2D" : "#64748b",
            cursor: "pointer",
            position: "relative",
            whiteSpace: "nowrap",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderBottom: activeTab === tab.id 
              ? "3px solid #FF7A2D" 
              : "3px solid transparent",
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.color = "#1e293b";
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.color = "#64748b";
            }
          }}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabsNavigation;