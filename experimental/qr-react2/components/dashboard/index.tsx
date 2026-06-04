"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { countProductImages, formatDateTime, getAllProducts, getAllScanLogs, Product, ScanLog } from "@/lib/qr-api"
import { ArrowRightLeft, ImageIcon, MousePointerClick, Package, Plus, QrCode } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface DashboardData {
  products: Product[]
  scans: ScanLog[]
  scanError: string
}

function useDashboardData() {
  const [data, setData] = useState<DashboardData>({ products: [], scans: [], scanError: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError("")
        const products = await getAllProducts()
        let scans: ScanLog[] = []
        let scanError = ""
        try {
          scans = await getAllScanLogs()
        } catch (err) {
          scanError = err instanceof Error ? err.message : "Scan log membutuhkan session admin."
        }
        setData({ products, scans, scanError })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat dashboard.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { ...data, loading, error }
}

function monthLabel(value?: string | null) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(value))
}

function DashboardState() {
  const { products, scans, scanError, loading, error } = useDashboardData()

  const productsWithImages = useMemo(() => products.filter((product) => countProductImages(product) > 0).length, [products])
  const scansToday = useMemo(() => {
    const today = new Date().toDateString()
    return scans.filter((scan) => scan.scanned_at && new Date(scan.scanned_at).toDateString() === today).length
  }, [scans])

  const productTrend = useMemo(() => {
    const map = new Map<string, number>()
    products.forEach((product) => {
      const label = monthLabel(product.created_at)
      map.set(label, (map.get(label) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).slice(-7)
  }, [products])

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    products.forEach((product) => {
      const label = product.tipe_kode || "Tanpa Tipe"
      map.set(label, (map.get(label) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [products])

  const recentRows = useMemo(() => {
    const recentProducts = products.slice(0, 5).map((product) => ({
      id: product.nomor_seri,
      title: product.nama_produk,
      meta: product.nomor_seri,
      type: "Produk",
      time: product.created_at,
    }))
    const recentScans = scans.slice(0, 5).map((scan) => ({
      id: `scan-${scan.id}`,
      title: scan.products?.nama_produk || scan.nomor_seri,
      meta: scan.nomor_seri,
      type: "Scan",
      time: scan.scanned_at,
    }))
    return [...recentScans, ...recentProducts]
      .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
      .slice(0, 6)
  }, [products, scans])

  if (loading) {
    return <Card><CardContent className="flex h-52 items-center justify-center"><Spinner /></CardContent></Card>
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Package /></EmptyMedia>
          <EmptyTitle>Gagal memuat dashboard</EmptyTitle>
          <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
        <StatCard title="Total Produk" value={products.length} icon={Package} />
        <StatCard title="Produk Bergambar" value={productsWithImages} icon={ImageIcon} />
        <StatCard title="Total Scan" value={scans.length} icon={MousePointerClick} muted={Boolean(scanError)} />
        <StatCard title="Scan Hari Ini" value={scansToday} icon={QrCode} muted={Boolean(scanError)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Produk Dibuat</CardTitle>
            <p className="text-sm text-muted-foreground">Distribusi produk berdasarkan bulan dibuat</p>
          </CardHeader>
          <CardContent>
            {productTrend.length ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" />
                    <XAxis dataKey="name" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} width={36} />
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
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Produk per Tipe</CardTitle>
            <p className="text-sm text-muted-foreground">Diambil dari kolom tipe_kode Supabase</p>
          </CardHeader>
          <CardContent>
            {categoryData.length ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0 0)" horizontal={false} />
                    <XAxis type="number" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="oklch(0.65 0 0)" fontSize={12} tickLine={false} axisLine={false} width={100} />
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

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
          <p className="text-sm text-muted-foreground">{scanError || "Gabungan produk baru dan scan QR terbaru"}</p>
        </CardHeader>
        <CardContent>
          {recentRows.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aktivitas</TableHead>
                  <TableHead>Nomor Seri</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-[260px] truncate font-medium">{row.title}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{row.meta}</TableCell>
                    <TableCell><Badge variant={row.type === "Scan" ? "default" : "secondary"}>{row.type}</Badge></TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatDateTime(row.time)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty><EmptyHeader><EmptyTitle>Belum ada aktivitas</EmptyTitle></EmptyHeader></Empty>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, muted = false }: { title: string; value: number; icon: typeof Package; muted?: boolean }) {
  return (
    <Card className={muted ? "opacity-70" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground md:text-sm">{title}</CardTitle>
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon data-icon="inline-start" />
        </div>
      </CardHeader>
      <CardContent>
        <span className="text-2xl font-bold md:text-3xl">{value.toLocaleString("id-ID")}</span>
      </CardContent>
    </Card>
  )
}

export function DesktopQuickActions() {
  return (
    <div className="flex gap-3">
      <Button asChild>
        <Link href="/inventory?action=add">
          <Plus data-icon="inline-start" />
          Tambah Produk
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/transactions">
          <ArrowRightLeft data-icon="inline-start" />
          Lihat Scan
        </Link>
      </Button>
    </div>
  )
}

export function MobileQuickActions() {
  return (
    <div className="flex gap-2">
      <Button asChild size="sm" className="flex-1">
        <Link href="/inventory?action=add">
          <Plus data-icon="inline-start" />
          Produk
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm" className="flex-1">
        <Link href="/transactions">
          <ArrowRightLeft data-icon="inline-start" />
          Scan
        </Link>
      </Button>
    </div>
  )
}

export function DesktopStatsCards() {
  return <DashboardState />
}

export function MobileStatsCards() {
  return <DashboardState />
}

export function DesktopCharts() {
  return null
}

export function MobileChart() {
  return null
}

export function DesktopRecentActivity() {
  return null
}

export function MobileRecentActivity() {
  return null
}
