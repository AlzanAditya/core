"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { getAllProducts, Product } from "@/lib/qr-api"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

function monthLabel(value?: string | null) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(value))
}

export function InventoryChart() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const productTrend = useMemo(() => {
    const map = new Map<string, number>()
    products.forEach((product) => {
      const key = monthLabel(product.created_at)
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).slice(-7)
  }, [products])

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    products.forEach((product) => {
      const key = product.tipe_kode || "Tanpa Tipe"
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [products])

  if (loading) {
    return <Card><CardContent className="flex h-52 items-center justify-center"><Spinner /></CardContent></Card>
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Produk Dibuat</CardTitle>
          <p className="text-xs md:text-sm text-muted-foreground">Distribusi produk berdasarkan bulan dibuat</p>
        </CardHeader>
        <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
          {productTrend.length ? (
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" />
                  <XAxis dataKey="name" stroke="oklch(0.65 0 0)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.65 0 0)" fontSize={10} tickLine={false} axisLine={false} width={30} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="oklch(0.55 0.18 162)" fill="oklch(0.55 0.18 162 / 0.2)" strokeWidth={2} name="Produk" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty><EmptyHeader><EmptyTitle>Belum ada produk</EmptyTitle></EmptyHeader></Empty>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 md:pb-4">
          <CardTitle className="text-base md:text-lg">Produk per Tipe</CardTitle>
          <p className="text-xs md:text-sm text-muted-foreground">Diambil dari kolom tipe_kode Supabase</p>
        </CardHeader>
        <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
          {categoryData.length ? (
            <div className="h-[200px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" horizontal={false} />
                  <XAxis type="number" stroke="oklch(0.65 0 0)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="oklch(0.65 0 0)" fontSize={10} tickLine={false} axisLine={false} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="oklch(0.55 0.18 162)" radius={[0, 4, 4, 0]} name="Produk" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty><EmptyHeader><EmptyTitle>Belum ada tipe produk</EmptyTitle></EmptyHeader></Empty>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
