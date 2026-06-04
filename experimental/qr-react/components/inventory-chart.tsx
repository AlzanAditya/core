"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export function InventoryChart() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg text-foreground">Aktivitas Stok</CardTitle>
          <p className="text-xs md:text-sm text-muted-foreground">
            Pergerakan barang 7 bulan terakhir
          </p>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockData}>
                <defs>
                  <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.18 162)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.18 162)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.15 250)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.15 250)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" />
                <XAxis
                  dataKey="name"
                  stroke="oklch(0.65 0 0)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="oklch(0.65 0 0)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.13 0 0)",
                    border: "1px solid oklch(0.22 0 0)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="masuk"
                  stroke="oklch(0.55 0.18 162)"
                  fillOpacity={1}
                  fill="url(#colorMasuk)"
                  strokeWidth={2}
                  name="Barang Masuk"
                />
                <Area
                  type="monotone"
                  dataKey="keluar"
                  stroke="oklch(0.55 0.15 250)"
                  fillOpacity={1}
                  fill="url(#colorKeluar)"
                  strokeWidth={2}
                  name="Barang Keluar"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg text-foreground">Stok per Kategori</CardTitle>
          <p className="text-xs md:text-sm text-muted-foreground">
            Distribusi stok berdasarkan kategori
          </p>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="oklch(0.65 0 0)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="oklch(0.65 0 0)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.13 0 0)",
                    border: "1px solid oklch(0.22 0 0)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="oklch(0.55 0.18 162)"
                  radius={[0, 4, 4, 0]}
                  name="Jumlah"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
