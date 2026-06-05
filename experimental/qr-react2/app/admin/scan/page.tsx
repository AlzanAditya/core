"use client"

import { useEffect, useMemo, useState } from "react"
import { AppLayout } from "@/components/layouts"
import { DataPagination } from "@/components/data-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateTime, getScanLogs, ScanLog } from "@/lib/qr-api"
import { Calendar, MousePointerClick, RefreshCw, Search, ShieldAlert } from "lucide-react"

export default function ScanPage() {
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const scansToday = useMemo(() => {
    const today = new Date().toDateString()
    return scanLogs.filter((log) => log.scanned_at && new Date(log.scanned_at).toDateString() === today).length
  }, [scanLogs])

  const uniqueProducts = useMemo(() => new Set(scanLogs.map((log) => log.nomor_seri)).size, [scanLogs])

  async function loadLogs() {
    try {
      setLoading(true)
      setError("")
      const result = await getScanLogs({ page, pageSize, search: searchQuery })
      setScanLogs(result.data)
      setTotal(result.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat scan.")
      setScanLogs([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [page, pageSize, searchQuery])

  const Stats = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? "grid grid-cols-3 gap-1.5" : "grid grid-cols-3 gap-4"}>
      <Card>
        <CardContent className={compact ? "p-2 text-center" : "flex items-center gap-4 p-4"}>
          {!compact && <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10"><MousePointerClick data-icon="inline-start" /></div>}
          <div>
            <p className="text-xs text-muted-foreground">Total Scan</p>
            <p className={compact ? "text-sm font-bold text-primary" : "text-2xl font-bold text-primary"}>{total}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className={compact ? "p-2 text-center" : "flex items-center gap-4 p-4"}>
          {!compact && <div className="flex size-12 items-center justify-center rounded-lg bg-chart-2/10"><Calendar data-icon="inline-start" /></div>}
          <div>
            <p className="text-xs text-muted-foreground">Scan Halaman Ini</p>
            <p className={compact ? "text-sm font-bold text-chart-2" : "text-2xl font-bold text-chart-2"}>{scanLogs.length}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className={compact ? "p-2 text-center" : "flex items-center gap-4 p-4"}>
          {!compact && <div className="flex size-12 items-center justify-center rounded-lg bg-chart-3/10"><MousePointerClick data-icon="inline-start" /></div>}
          <div>
            <p className="text-xs text-muted-foreground">Produk Unik</p>
            <p className={compact ? "text-sm font-bold text-chart-3" : "text-2xl font-bold text-chart-3"}>{uniqueProducts}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const LogsTable = ({ compact = false }: { compact?: boolean }) => (
    <Card>
      <CardHeader className={compact ? "p-3 pb-2" : "pb-4"}>
        <CardTitle className={compact ? "text-sm" : undefined}>Riwayat Scan QR</CardTitle>
        <CardDescription>{total} log scan dari Supabase</CardDescription>
      </CardHeader>
      <CardContent className={compact ? "p-3 pt-0" : undefined}>
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-icon="inline-start" />
            <Input
              placeholder="Cari nomor seri..."
              value={searchQuery}
              onChange={(event) => {
                setPage(1)
                setSearchQuery(event.target.value)
              }}
              className="bg-secondary pl-9"
            />
          </div>
          {!compact && (
            <Button variant="outline" onClick={loadLogs}>
              <RefreshCw data-icon="inline-start" />
              Refresh
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center"><Spinner /></div>
        ) : error ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><ShieldAlert /></EmptyMedia>
              <EmptyTitle>Tidak bisa memuat scan log</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" onClick={loadLogs}>Coba Lagi</Button>
          </Empty>
        ) : scanLogs.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><MousePointerClick /></EmptyMedia>
              <EmptyTitle>Belum ada transaksi scan</EmptyTitle>
              <EmptyDescription>Data akan muncul saat halaman produk public dibuka dari QR.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : compact ? (
          <div className="flex flex-col gap-2">
            {scanLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{log.products?.nama_produk || log.nomor_seri}</p>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">{formatDateTime(log.scanned_at)}</p>
                    </div>
                    <Badge variant="secondary">Scan</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Nomor Seri</TableHead>
                <TableHead>Referer</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scanLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">SCN{String(log.id).padStart(4, "0")}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDateTime(log.scanned_at)}</TableCell>
                  <TableCell className="max-w-[240px] truncate font-medium">{log.products?.nama_produk || "-"}</TableCell>
                  <TableCell><Badge variant="secondary" className="font-mono">{log.nomor_seri}</Badge></TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">{log.referer || "-"}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ip_address || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <DataPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setPage(1)
            setPageSize(value)
          }}
        />
      </CardContent>
    </Card>
  )

  const DesktopContent = () => (
    <div className="flex flex-col gap-6">
      <Stats />
      <LogsTable />
    </div>
  )

  const MobileContent = () => (
    <div className="flex flex-col gap-2.5">
      <Stats compact />
      <LogsTable compact />
    </div>
  )

  return (
    <AppLayout
      title="Scan"
      subtitle="Riwayat scan QR dari Supabase"
      desktopActions={<Button variant="outline" onClick={loadLogs}><RefreshCw data-icon="inline-start" />Refresh</Button>}
      mobileActions={<Button variant="outline" size="sm" className="w-full" onClick={loadLogs}><RefreshCw data-icon="inline-start" />Refresh</Button>}
      desktopContent={<DesktopContent />}
      mobileContent={<MobileContent />}
    />
  )
}
