"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { countProductImages, getAllProducts, getAllScanLogs, Product, ScanLog } from "@/lib/qr-api"
import { ImageIcon, MousePointerClick, Package, QrCode } from "lucide-react"

export function StatsCards() {
  const [products, setProducts] = useState<Product[]>([])
  const [scans, setScans] = useState<ScanLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const loadedProducts = await getAllProducts()
      setProducts(loadedProducts)
      try {
        setScans(await getAllScanLogs())
      } catch {
        setScans([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const scansToday = useMemo(() => {
    const today = new Date().toDateString()
    return scans.filter((scan) => scan.scanned_at && new Date(scan.scanned_at).toDateString() === today).length
  }, [scans])

  const stats = [
    { title: "Total Produk", value: products.length, icon: Package, description: "produk di Supabase" },
    { title: "Produk Bergambar", value: products.filter((product) => countProductImages(product) > 0).length, icon: ImageIcon, description: "punya minimal satu foto" },
    { title: "Total Scan", value: scans.length, icon: MousePointerClick, description: "scan log tersedia" },
    { title: "Scan Hari Ini", value: scansToday, icon: QrCode, description: "berdasarkan scan_logs" },
  ]

  if (loading) {
    return <Card><CardContent className="flex h-36 items-center justify-center"><Spinner /></CardContent></Card>
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 md:p-6 md:pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground md:text-sm">
              {stat.title}
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 md:size-9">
              <stat.icon data-icon="inline-start" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <span className="text-xl font-bold text-foreground md:text-3xl">{stat.value.toLocaleString("id-ID")}</span>
            <p className="mt-0.5 text-[10px] text-muted-foreground md:mt-1 md:text-xs">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
