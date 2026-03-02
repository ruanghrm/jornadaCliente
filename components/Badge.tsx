import React from "react"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface BadgeProps {
  children: React.ReactNode
  status: "online" | "offline" | "warning"
}

export const Badge: React.FC<BadgeProps> = ({ children, status }) => {
  const Icon = status === "online" ? CheckCircle : 
                status === "offline" ? XCircle : AlertCircle
  
  return (
    <span className={`badge badge-${status}`}>
      <Icon size={12} />
      {children}
    </span>
  )
}