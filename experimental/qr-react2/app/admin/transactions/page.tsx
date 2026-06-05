"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AppLayout } from "@/components/layouts"
import { DataPagination } from "@/components/data-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  createTransaction,
  emptyTransactionForm,
  formatDateTime,
  getAllProducts,
  getTransactions,
  InventoryTransaction,
  InventoryTransactionFormData,
  Product,
} from "@/lib/qr-api"
import { ArrowDownCircle, ArrowUpCircle, Plus, RefreshCw, Save, Search, ShieldAlert } from "lucide-react"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formData, setFormData] = useState<InventoryTransactionFormData>(emptyTransactionForm)

  async function loadTransactions() {
    try {
      setLoading(true)
      setError("")
      const loadedProducts = await getAllProducts()
      setProducts(loadedProducts)
      const transactionResult = await getTransactions({ page, pageSize, search: searchQuery })
      setTransactions(transactionResult.data)
      setTotal(transactionResult.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat transaksi.")
      setTransactions([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [page, pageSize, searchQuery])

  useEffect(() => {
    if (new URL(window.location.href).searchParams.get("action") === "add") {
      setDrawerOpen(true)
    }
  }, [])

  const totalMasuk = transactions.filter((item) => item.type === "masuk").reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const totalKeluar = transactions.filter((item) => item.type === "keluar").reduce((sum, item) => sum + Number(item.quantity || 0), 0)

  const handleSave = async () => {
    if (!formData.nomor_seri || Number(formData.quantity) <= 0) {
      toast.error("Produk dan jumlah wajib diisi.")
      return
    }

    try {
      setSaving(true)
      await createTransaction(formData)
      toast.success("Transaksi berhasil disimpan.")
      setDrawerOpen(false)
      setFormData(emptyTransactionForm)
      await loadTransactions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan transaksi.")
    } finally {
      setSaving(false)
    }
  }

  const TransactionDrawer = () => (
    <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerContent className="w-full sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Tambah Transaksi</DrawerTitle>
          <DrawerDescription>Catat barang masuk atau keluar berdasarkan produk ETS.</DrawerDescription>
        </DrawerHeader>
        <div className="no-scrollbar flex flex-col gap-4 overflow-y-auto px-4">
          <div className="flex flex-col gap-2">
            <Label>Produk</Label>
            <Select value={formData.nomor_seri} onValueChange={(value) => setFormData({ ...formData, nomor_seri: value })}>
              <SelectTrigger className="bg-secondary">
                <SelectValue placeholder="Pilih produk" />
              </SelectTrigger>
              <SelectContent>
                {products.length ? (
                  products.map((product) => (
                    <SelectItem key={product.nomor_seri} value={product.nomor_seri}>
                      {product.nama_produk}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__empty" disabled>Produk belum tersedia</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tipe</Label>
            <Select value={formData.type} onValueChange={(value: "masuk" | "keluar") => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masuk">Masuk</SelectItem>
                <SelectItem value="keluar">Keluar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Jumlah</Label>
            <Input type="number" value={formData.quantity} onChange={(event) => setFormData({ ...formData, quantity: event.target.value })} className="bg-secondary" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Operator</Label>
            <Input value={formData.operator} onChange={(event) => setFormData({ ...formData, operator: event.target.value })} className="bg-secondary" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Catatan</Label>
            <Textarea value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} className="min-h-24 bg-secondary" />
          </div>
        </div>
        <DrawerFooter>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Spinner /> : <Save data-icon="inline-start" />}
            Simpan
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Batal</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )

  const Content = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex flex-col gap-4">
      <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-3 gap-4"}>
        <Card><CardContent className={compact ? "p-3 text-center" : "flex items-center gap-4 p-4"}><ArrowDownCircle className="text-primary" /><div><p className="text-xs text-muted-foreground">Masuk</p><p className="text-2xl font-bold text-primary">{totalMasuk}</p></div></CardContent></Card>
        <Card><CardContent className={compact ? "p-3 text-center" : "flex items-center gap-4 p-4"}><ArrowUpCircle className="text-chart-2" /><div><p className="text-xs text-muted-foreground">Keluar</p><p className="text-2xl font-bold text-chart-2">{totalKeluar}</p></div></CardContent></Card>
        {!compact && <Card><CardContent className="flex items-center gap-4 p-4"><Plus className="text-chart-3" /><div><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold text-chart-3">{total}</p></div></CardContent></Card>}
      </div>

      <Card>
        <CardHeader className={compact ? "p-3 pb-2" : "pb-4"}>
          <CardTitle className={compact ? "text-sm" : undefined}>Riwayat Transaksi</CardTitle>
          <CardDescription>{total} transaksi dari tabel Supabase transactions</CardDescription>
        </CardHeader>
        <CardContent className={compact ? "p-3 pt-0" : undefined}>
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-icon="inline-start" />
              <Input placeholder="Cari nomor seri..." value={searchQuery} onChange={(event) => { setPage(1); setSearchQuery(event.target.value) }} className="bg-secondary pl-9" />
            </div>
            {!compact && <Button variant="outline" onClick={loadTransactions}><RefreshCw data-icon="inline-start" />Refresh</Button>}
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center"><Spinner /></div>
          ) : error ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><ShieldAlert /></EmptyMedia>
                <EmptyTitle>Tidak bisa memuat transaksi</EmptyTitle>
                <EmptyDescription>{error}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : transactions.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><Plus /></EmptyMedia>
                <EmptyTitle>Belum ada transaksi</EmptyTitle>
                <EmptyDescription>Transaksi baru akan muncul setelah tersimpan di Supabase.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : compact ? (
            <div className="flex flex-col gap-2">
              {transactions.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">{item.products?.nama_produk || item.nomor_seri}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{formatDateTime(item.created_at)}</p>
                      </div>
                      <Badge variant={item.type === "masuk" ? "default" : "secondary"}>{item.type}</Badge>
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
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Operator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">TRX{String(item.id).padStart(4, "0")}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(item.created_at)}</TableCell>
                    <TableCell className="max-w-[220px] truncate font-medium">{item.products?.nama_produk || "-"}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-mono">{item.nomor_seri}</Badge></TableCell>
                    <TableCell><Badge variant={item.type === "masuk" ? "default" : "secondary"}>{item.type === "masuk" ? "Masuk" : "Keluar"}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                    <TableCell>{item.operator || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <DataPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(value) => { setPage(1); setPageSize(value) }} />
        </CardContent>
      </Card>
    </div>
  )

  return (
    <>
      <AppLayout
        title="Transaksi"
        subtitle="Riwayat barang masuk dan keluar"
        desktopActions={<Button onClick={() => setDrawerOpen(true)}><Plus data-icon="inline-start" />Tambah Transaksi</Button>}
        mobileActions={<Button onClick={() => setDrawerOpen(true)} size="sm" className="w-full"><Plus data-icon="inline-start" />Tambah Transaksi</Button>}
        desktopContent={<Content />}
        mobileContent={<Content compact />}
      />
      <TransactionDrawer />
    </>
  )
}
