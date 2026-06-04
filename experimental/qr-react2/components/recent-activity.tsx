"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateTime, getAllProducts, getAllScanLogs, Product, ScanLog } from "@/lib/qr-api"

export function RecentActivity() {
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

  const rows = useMemo(() => {
    const productRows = products.slice(0, 5).map((product) => ({
      id: product.nomor_seri,
      title: product.nama_produk,
      meta: product.nomor_seri,
      type: "Produk",
      time: product.created_at,
    }))
    const scanRows = scans.slice(0, 5).map((scan) => ({
      id: `scan-${scan.id}`,
      title: scan.products?.nama_produk || scan.nomor_seri,
      meta: scan.nomor_seri,
      type: "Scan",
      time: scan.scanned_at,
    }))
    return [...scanRows, ...productRows]
      .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
      .slice(0, 6)
  }, [products, scans])

  return (
    <Card>
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="text-base md:text-lg">Aktivitas Terbaru</CardTitle>
        <p className="text-xs md:text-sm text-muted-foreground">Gabungan produk baru dan scan QR terbaru</p>
      </CardHeader>
      <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
        {loading ? (
          <div className="flex h-40 items-center justify-center"><Spinner /></div>
        ) : rows.length ? (
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
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-[220px] truncate font-medium">{row.title}</TableCell>
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
  )
}
