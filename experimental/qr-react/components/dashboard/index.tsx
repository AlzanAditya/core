"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, Plus, ArrowRightLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

// Data
const stats = [
  { title: "Total Produk", value: "2,847", change: "+12%", trend: "up", icon: Package, desc: "dari bulan lalu" },
  { title: "Barang Masuk", value: "1,234", change: "+8%", trend: "up", icon: TrendingUp, desc: "minggu ini" },
  { title: "Barang Keluar", value: "856", change: "-3%", trend: "down", icon: TrendingDown, desc: "minggu ini" },
  { title: "Stok Menipis", value: "23", change: "+5", trend: "warning", icon: AlertTriangle, desc: "perlu restock" },
]

const stockData = [
  { name: "Jan", masuk: 400, keluar: 240 },
  { name: "Feb", masuk: 300, keluar: 139 },
  { name: "Mar", masuk: 520, keluar: 380 },
  { name: "Apr", masuk: 278, keluar: 390 },
  { name: "Mei", masuk: 489, keluar: 480 },
  { name: "Jun", masuk: 590, keluar: 380 },
  { name: "Jul", masuk: 610, keluar: 430 },
]

const categoryData = [
  { name: "UPS", value: 850 },
  { name: "Stabilizer", value: 620 },
  { name: "Inverter", value: 480 },
  { name: "Fuse", value: 320 },
  { name: "Lainnya", value: 280 },
]

const recentActivities = [
  { id: "TRX001", product: "PowerShield Ultra 5000VA", type: "masuk", quantity: 25, time: "10 menit lalu" },
  { id: "TRX002", product: "StabilVolt Pro 3000", type: "keluar", quantity: 10, time: "25 menit lalu" },
  { id: "TRX003", product: "UPS Compact 1500VA", type: "masuk", quantity: 50, time: "1 jam lalu" },
  { id: "TRX004", product: "Inverter Pure Sine 2000W", type: "keluar", quantity: 15, time: "2 jam lalu" },
  { id: "TRX005", product: "Stabilizer Industrial 10KVA", type: "masuk", quantity: 20, time: "3 jam lalu" },
]

// Desktop Quick Actions
export function DesktopQuickActions() {
  return (
    <div className="flex gap-3">
      <Button asChild>
        <Link href="/inventory?action=add">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/transactions?action=add">
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Buat Transaksi
        </Link>
      </Button>
    </div>
  )
}

// Mobile Quick Actions - Compact
export function MobileQuickActions() {
  return (
    <div className="flex gap-2">
      <Button asChild size="sm" className="flex-1 h-8 text-xs">
        <Link href="/inventory?action=add">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Produk
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs">
        <Link href="/transactions?action=add">
          <ArrowRightLeft className="mr-1 h-3.5 w-3.5" />
          Transaksi
        </Link>
      </Button>
    </div>
  )
}

// Desktop Stats Cards
export function DesktopStatsCards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              stat.trend === "warning" ? "bg-destructive/10" : "bg-primary/10"
            )}>
              <stat.icon className={cn("h-5 w-5", stat.trend === "warning" ? "text-destructive" : "text-primary")} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{stat.value}</span>
              <span className={cn(
                "flex items-center text-sm font-medium",
                stat.trend === "up" && "text-primary",
                stat.trend === "down" && "text-destructive",
                stat.trend === "warning" && "text-chart-3"
              )}>
                {stat.change}
                <ArrowUpRight className={cn("ml-0.5 h-3 w-3", stat.trend === "down" && "rotate-90")} />
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{stat.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Mobile Stats Cards - Compact 2x2 Grid
export function MobileStatsCards() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card border-border">
          <CardContent className="p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">{stat.title}</span>
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded",
                stat.trend === "warning" ? "bg-destructive/10" : "bg-primary/10"
              )}>
                <stat.icon className={cn("h-3 w-3", stat.trend === "warning" ? "text-destructive" : "text-primary")} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">{stat.value}</span>
              <span className={cn(
                "text-[10px] font-medium",
                stat.trend === "up" && "text-primary",
                stat.trend === "down" && "text-destructive",
                stat.trend === "warning" && "text-chart-3"
              )}>
                {stat.change}
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground">{stat.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Desktop Charts
export function DesktopCharts() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-foreground">Aktivitas Stok</CardTitle>
          <p className="text-sm text-muted-foreground">Pergerakan barang 7 bulan terakhir</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockData}>
                <defs>
                  <linearGradient id="colorMasukDesktop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.18 162)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.18 162)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorKeluarDesktop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.15 250)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.15 250)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" />
                <XAxis dataKey="name" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.13 0 0)",
                    border: "1px solid oklch(0.22 0 0)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)",
                  }}
                />
                <Area type="monotone" dataKey="masuk" stroke="oklch(0.55 0.18 162)" fillOpacity={1} fill="url(#colorMasukDesktop)" strokeWidth={2} name="Barang Masuk" />
                <Area type="monotone" dataKey="keluar" stroke="oklch(0.55 0.15 250)" fillOpacity={1} fill="url(#colorKeluarDesktop)" strokeWidth={2} name="Barang Keluar" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-foreground">Stok per Kategori</CardTitle>
          <p className="text-sm text-muted-foreground">Distribusi stok berdasarkan kategori</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} width={70} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.13 0 0)",
                    border: "1px solid oklch(0.22 0 0)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)",
                  }}
                />
                <Bar dataKey="value" fill="oklch(0.55 0.18 162)" radius={[0, 4, 4, 0]} name="Jumlah" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Mobile Chart - Single compact chart
export function MobileChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="p-2.5 pb-1">
        <CardTitle className="text-xs text-foreground">Aktivitas Stok</CardTitle>
        <p className="text-[10px] text-muted-foreground">7 bulan terakhir</p>
      </CardHeader>
      <CardContent className="p-2.5 pt-0">
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stockData}>
              <defs>
                <linearGradient id="colorMasukMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.18 162)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.55 0.18 162)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="oklch(0.65 0 0)" fontSize={8} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.65 0 0)" fontSize={8} tickLine={false} axisLine={false} width={24} />
              <Area type="monotone" dataKey="masuk" stroke="oklch(0.55 0.18 162)" fillOpacity={1} fill="url(#colorMasukMobile)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Desktop Recent Activity
export function DesktopRecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-foreground">Aktivitas Terbaru</CardTitle>
        <p className="text-sm text-muted-foreground">Daftar transaksi barang masuk dan keluar terbaru</p>
      </CardHeader>
      <CardContent>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground pb-3">ID</th>
              <th className="text-left text-xs font-medium text-muted-foreground pb-3">Produk</th>
              <th className="text-left text-xs font-medium text-muted-foreground pb-3">Tipe</th>
              <th className="text-right text-xs font-medium text-muted-foreground pb-3">Jumlah</th>
              <th className="text-right text-xs font-medium text-muted-foreground pb-3">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {recentActivities.map((activity) => (
              <tr key={activity.id} className="border-b border-border">
                <td className="py-3 font-mono text-xs text-foreground">{activity.id}</td>
                <td className="py-3 font-medium text-sm text-foreground max-w-[200px] truncate">{activity.product}</td>
                <td className="py-3">
                  <Badge className={cn(
                    "text-xs",
                    activity.type === "masuk" ? "bg-primary/10 text-primary" : "bg-chart-2/10 text-chart-2"
                  )}>
                    {activity.type === "masuk" ? "Masuk" : "Keluar"}
                  </Badge>
                </td>
                <td className="py-3 text-right font-medium text-sm text-foreground">{activity.quantity}</td>
                <td className="py-3 text-right text-xs text-muted-foreground">{activity.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

// Mobile Recent Activity - Compact list
export function MobileRecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="p-2.5 pb-1.5">
        <CardTitle className="text-xs text-foreground">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="p-2.5 pt-0">
        <div className="space-y-2">
          {recentActivities.slice(0, 4).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <div className="flex-1 min-w-0 mr-2">
                <p className="font-medium text-[11px] text-foreground truncate">{activity.product}</p>
                <p className="text-[9px] text-muted-foreground">{activity.time}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={cn(
                  "text-[11px] font-semibold",
                  activity.type === "masuk" ? "text-primary" : "text-chart-2"
                )}>
                  {activity.type === "masuk" ? "+" : "-"}{activity.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
