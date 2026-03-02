// src/components/Card.tsx
import React from "react";

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub?: React.ReactNode;
  accent?: boolean;
  variant?: "default" | "gradient" | "bordered";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const Card: React.FC<CardProps> = ({ 
  icon, 
  title, 
  value, 
  sub, 
  accent, 
  variant = "default",
  trend 
}) => {
  const getCardStyle = () => {
    const baseStyle = {
      background: variant === "gradient" 
        ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" 
        : "#ffffff",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: variant === "bordered" 
        ? "0 1px 3px rgba(0,0,0,0.04)" 
        : "0 8px 25px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px",
      border: variant === "bordered" ? "1px solid #f1f5f9" : "none",
      borderLeft: accent ? "4px solid #ff7a2d" : "none",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      position: "relative" as const,
      overflow: "hidden" as const,
    };

    return baseStyle;
  };

  const getTrendColor = () => {
    if (!trend) return "#64748b";
    return trend.isPositive ? "#10b981" : "#ef4444";
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.isPositive ? "↗" : "↘";
  };

  // Função para clonar o ícone e aplicar estilo branco
  const getWhiteIcon = () => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement, {
        style: {
          color: "#ffffff",
          fontSize: "1.2rem",
          ...(icon as React.ReactElement).props?.style
        }
      });
    }
    return icon;
  };

  return (
    <div
      style={getCardStyle()}
      onMouseEnter={(e) => {
        if (variant !== "bordered") {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 12px 35px rgba(0,0,0,0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (variant !== "bordered") {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = variant === "default" 
            ? "0 1px 3px rgba(0,0,0,0.04)" 
            : "0 8px 25px rgba(0,0,0,0.08)";
        }
      }}
    >
      {/* Efeito de brilho sutil no hover */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,122,45,0.03), transparent)",
          transition: "left 0.6s ease",
          pointerEvents: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.left = "100%";
        }}
      />

      {/* Header do Card */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        marginBottom: "4px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ff7a2d 0%, #ff5722 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: "1.2rem",
            flexShrink: 0
          }}>
            {getWhiteIcon()}
          </div>
          <h3 style={{ 
            color: "#475569", 
            fontSize: "0.9rem", 
            margin: 0,
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            {title}
          </h3>
        </div>

        {/* Indicador de Trend */}
        {trend && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 8px",
            borderRadius: "20px",
            background: `${getTrendColor()}15`,
            color: getTrendColor(),
            fontSize: "0.75rem",
            fontWeight: "600"
          }}>
            <span>{getTrendIcon()}</span>
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>

      {/* Valor Principal */}
      <div style={{ 
        fontSize: "2rem", 
        fontWeight: "700", 
        color: "#1e293b",
        lineHeight: "1.2",
        margin: "8px 0 4px 0"
      }}>
        {value}
      </div>

      {/* Conteúdo Secundário */}
      {sub && (
        <div style={{ 
          color: "#64748b", 
          fontSize: "0.85rem", 
          lineHeight: "1.5",
          marginTop: "4px"
        }}>
          {sub}
        </div>
      )}

      {/* Barra de progresso sutil (opcional) */}
      {accent && (
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "3px",
          background: "linear-gradient(90deg, #ff7a2d 0%, #ff5722 100%)",
          opacity: 0.1
        }} />
      )}
    </div>
  );
};

export default Card;