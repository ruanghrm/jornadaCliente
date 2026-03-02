// components/CardGeneric.tsx
import React from "react"

interface CardGenericProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const CardGeneric: React.FC<CardGenericProps> = ({ 
  children, 
  className = "", 
  onClick 
}) => (
  <div className={`card ${className}`} onClick={onClick}>
    {children}
  </div>
)