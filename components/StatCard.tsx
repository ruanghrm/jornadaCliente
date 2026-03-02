// components/StatCard.tsx
import React from "react"
import { CardGeneric } from "./CardGeneric"  // ← Importa o Card genérico

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend }) => (
  <CardGeneric className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <span className="stat-title">{title}</span>
      <span className="stat-value">{value}</span>
      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
    </div>
    {trend && <div className={`stat-trend trend-${trend}`} />}
  </CardGeneric>
)