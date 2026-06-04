"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  {
    title: "Total Produk",
    value: "2,847",
    change: "+12%",
    trend: "up",
    icon: Package,
    description: "dari bulan lalu",
  },
  {
    title: "Barang Masuk",
    value: "1,234",
    change: "+8%",
    trend: "up",
    icon: TrendingUp,
    description: "minggu ini",
  },
  {
    title: "Barang Keluar",
    value: "856",
    change: "-3%",
    trend: "down",
    icon: TrendingDown,
    description: "minggu ini",
  },
  {
    title: "Stok Menipis",
    value: "23",
    change: "+5",
    trend: "warning",
    icon: AlertTriangle,
    description: "perlu restock",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={cn(
              "flex h-7 w-7 md:h-9 md:w-9 items-center justify-center rounded-lg",
              stat.trend === "warning" ? "bg-destructive/10" : "bg-primary/10"
            )}>
              <stat.icon className={cn(
                "h-4 w-4 md:h-5 md:w-5",
                stat.trend === "warning" ? "text-destructive" : "text-primary"
              )} />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="flex items-baseline gap-1 md:gap-2">
              <span className="text-xl md:text-3xl font-bold text-foreground">{stat.value}</span>
              <span className={cn(
                "flex items-center text-[10px] md:text-sm font-medium",
                stat.trend === "up" && "text-primary",
                stat.trend === "down" && "text-destructive",
                stat.trend === "warning" && "text-chart-3"
              )}>
                {stat.change}
                <ArrowUpRight className={cn(
                  "ml-0.5 h-2.5 w-2.5 md:h-3 md:w-3",
                  stat.trend === "down" && "rotate-90"
                )} />
              </span>
            </div>
            <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
