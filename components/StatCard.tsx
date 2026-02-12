import React from "react"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color?: "primary" | "secondary" | "accent"
}

export function StatCard({ icon, label, value, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
  }

  return (
    <div className="card-premium p-4 text-center hover-scale">
      <div className={`flex justify-center mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  )
}
