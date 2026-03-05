import React from "react"

interface UsinaButtonProps {
  children?: React.ReactNode
  onClick: () => void
  variant?: "primary" | "secondary" | "ghost"
  icon?: React.ReactNode
  disabled?: boolean;
  className?: string
}

export const UsinaButton: React.FC<UsinaButtonProps> = ({ 
  children, 
  onClick, 
  variant = "primary", 
  icon, 
  className = "" 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          background: "var(--primary)",
          color: "white",
          hoverBackground: "var(--primary-dark)"
        }
      case "secondary":
        return {
          background: "var(--gray-100)",
          color: "var(--gray-700)",
          hoverBackground: "var(--gray-200)"
        }
      case "ghost":
        return {
          background: "transparent",
          color: "var(--gray-600)",
          border: "1px solid var(--gray-300)",
          hoverBackground: "var(--gray-100)"
        }
      default:
        return {
          background: "var(--primary)",
          color: "white",
          hoverBackground: "var(--primary-dark)"
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <button
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "0.625rem 1.25rem",
        borderRadius: "var(--radius)",
        fontWeight: 500,
        fontSize: "0.875rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        border: "none",
        outline: "none",
        background: styles.background,
        color: styles.color,
        ...(variant === "ghost" ? { border: "1px solid var(--gray-300)" } : {})
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = styles.hoverBackground || styles.background
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = styles.background
      }}
    >
      {icon && <span className="icon">{icon}</span>}
      {children}
    </button>
  )
}