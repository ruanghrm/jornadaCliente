import React from "react";
import { FaTrash, FaEdit, FaCheck, FaPaperPlane, FaLockOpen } from "react-icons/fa";
import { SiWhatsapp } from "react-icons/si";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?:
  | "save"
  | "edit"
  | "delete"
  | "danger" // novo tipo danger
  | "whatsapp"
  | "primary"
  | "secondary"
  | "close"
  | "neutral"
  | "success"; // adicionei success também para consistência
  icon?: boolean;
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  icon = true,
  size = "md",
  disabled,
  ...props
}) => {
  const getStyles = () => {
    const baseStyles = {
      save: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        hover: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
        active: "linear-gradient(135deg, #059669 0%, #047857 100%)",
        shadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
        hoverShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
        color: "#fff",
        icon: <FaCheck />
      },
      success: { // alias para save
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        hover: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
        active: "linear-gradient(135deg, #059669 0%, #047857 100%)",
        shadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
        hoverShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
        color: "#fff",
        icon: <FaCheck />
      },
      edit: {
        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        hover: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
        active: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
        shadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
        hoverShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
        color: "#fff",
        icon: <FaEdit />
      },
      delete: {
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        hover: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
        active: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
        shadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
        hoverShadow: "0 6px 20px rgba(239, 68, 68, 0.4)",
        color: "#fff",
        icon: <FaTrash />
      },
      danger: { // mesmo estilo que delete
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        hover: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
        active: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
        shadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
        hoverShadow: "0 6px 20px rgba(239, 68, 68, 0.4)",
        color: "#fff",
        icon: <FaTrash />
      },
      close: {
        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        hover: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
        active: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
        shadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
        hoverShadow: "0 6px 20px rgba(249, 115, 22, 0.4)",
        color: "#fff",
        icon: <FaLockOpen />
      },
      whatsapp: {
        background: "linear-gradient(135deg, #25D366 0%, #1ebe57 100%)",
        hover: "linear-gradient(135deg, #45e37c 0%, #25D366 100%)",
        active: "linear-gradient(135deg, #1ebe57 0%, #189345 100%)",
        shadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
        hoverShadow: "0 6px 20px rgba(37, 211, 102, 0.4)",
        color: "#fff",
        icon: <SiWhatsapp />
      },
      neutral: {
        background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
        hover: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
        active: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)",
        shadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        hoverShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
        color: "#334155",
        icon: null
      },
      secondary: {
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        hover: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
        active: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
        shadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        hoverShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        color: "#334155",
        icon: null
      },
      primary: {
        background: "linear-gradient(135deg, #ff7a2d 0%, #ff5722 100%)",
        hover: "linear-gradient(135deg, #ff914d 0%, #ff7a2d 100%)",
        active: "linear-gradient(135deg, #ff5722 0%, #e64a19 100%)",
        shadow: "0 4px 12px rgba(255, 122, 45, 0.3)",
        hoverShadow: "0 6px 20px rgba(255, 122, 45, 0.4)",
        color: "#fff",
        icon: <FaPaperPlane />
      }
    };

    return baseStyles[variant] || baseStyles.primary;
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return { padding: "6px 12px", fontSize: "0.85rem", iconSize: "14px" };
      case "lg":
        return { padding: "14px 24px", fontSize: "1.1rem", iconSize: "20px" };
      default:
        return { padding: "10px 18px", fontSize: "0.95rem", iconSize: "16px" };
    }
  };

  const styles = getStyles();
  const sizeStyles = getSizeStyles();

  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: icon && children && styles.icon ? "8px" : "0",
        padding: sizeStyles.padding,
        borderRadius: "10px",
        background: disabled ? "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)" : styles.background,
        color: disabled ? "#64748b" : styles.color,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.3s ease",
        boxShadow: disabled ? "none" : styles.shadow,
        fontWeight: 600,
        fontSize: sizeStyles.fontSize,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        ...props.style // permite override de estilos
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = styles.hover;
          e.currentTarget.style.boxShadow = styles.hoverShadow;
          if (props.onMouseEnter) props.onMouseEnter(e);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = styles.background;
          e.currentTarget.style.boxShadow = styles.shadow;
          if (props.onMouseLeave) props.onMouseLeave(e);
        }
      }}
    >
      {icon && styles.icon && (
        <span style={{ fontSize: sizeStyles.iconSize, display: "flex", alignItems: "center" }}>
          {styles.icon}
        </span>
      )}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;
export { Button };