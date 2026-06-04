"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layouts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Search, Plus, ArrowDownCircle, ArrowUpCircle, Calendar, Save } from "lucide-react"
import { cn } from "@/lib/utils"

const initialTransactions = [
  { id: "TRX001", date: "2024-01-15", time: "09:30", product: "PowerShield Ultra 5000VA", sku: "SN-UPS-20240101", type: "masuk", quantity: 25, operator: "Ahmad Ridwan", notes: "Dari supplier" },
  { id: "TRX002", date: "2024-01-15", time: "10:15", product: "StabilVolt Pro 3000", sku: "SN-STB-20240215", type: "keluar", quantity: 10, operator: "Siti Nurhaliza", notes: "Pesanan PT ABC" },
  { id: "TRX003", date: "2024-01-15", time: "11:00", product: "UPS Compact 1500VA", sku: "SN-UPS-20230901", type: "masuk", quantity: 50, operator: "Ahmad Ridwan", notes: "Restock" },
  { id: "TRX004", date: "2024-01-14", time: "14:30", product: "Inverter Pure Sine 2000W", sku: "SN-INV-20240310", type: "keluar", quantity: 15, operator: "Budi Santoso", notes: "Pesanan CV XYZ" },
  { id: "TRX005", date: "2024-01-14", time: "16:00", product: "Stabilizer Industrial 10KVA", sku: "SN-STB-20240520", type: "masuk", quantity: 20, operator: "Ahmad Ridwan", notes: "Dari supplier" },
]

const products = [
  { id: "PRD001", name: "PowerShield Ultra 5000VA", sku: "SN-UPS-20240101" },
  { id: "PRD002", name: "StabilVolt Pro 3000", sku: "SN-STB-20240215" },
  { id: "PRD003", name: "UPS Compact 1500VA", sku: "SN-UPS-20230901" },
  { id: "PRD004", name: "Inverter Pure Sine 2000W", sku: "SN-INV-20240310" },
  { id: "PRD005", name: "Stabilizer Industrial 10KVA", sku: "SN-STB-20240520" },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formData, setFormData] = useState({ productId: "", type: "masuk", quantity: 0, operator: "", notes: "" })

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.product.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || t.type === typeFilter
    return matchesSearch && matchesType
  })

  const totalMasuk = transactions.filter((t) => t.type === "masuk").reduce((sum, t) => sum + t.quantity, 0)
  const totalKeluar = transactions.filter((t) => t.type === "keluar").reduce((sum, t) => sum + t.quantity, 0)

  const handleSave = () => {
    const product = products.find(p => p.id === formData.productId)
    if (!product) return
    const newTransaction = {
      id: `TRX${String(transactions.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      product: product.name,
      sku: product.sku,
      type: formData.type,
      quantity: formData.quantity,
      operator: formData.operator,
      notes: formData.notes,
    }
    setTransactions([newTransaction, ...transactions])
    setIsAddOpen(false)
    setFormData({ productId: "", type: "masuk", quantity: 0, operator: "", notes: "" })
  }

  // Desktop Actions
  const DesktopActions = () => (
    <Button onClick={() => setIsAddOpen(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Tambah Transaksi
    </Button>
  )

  // Mobile Actions
  const MobileActions = () => (
    <Button onClick={() => setIsAddOpen(true)} size="sm" className="w-full h-8 text-xs">
      <Plus className="mr-1 h-3.5 w-3.5" />
      Tambah Transaksi
    </Button>
  )

  // Desktop Content
  const DesktopContent = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <ArrowDownCircle className="h-6 w-6 text-primary" />
            </div>
            <div><p className="text-sm text-muted-foreground">Total Masuk</p><p className="text-2xl font-bold text-primary">{totalMasuk}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
              <ArrowUpCircle className="h-6 w-6 text-chart-2" />
            </div>
            <div><p className="text-sm text-muted-foreground">Total Keluar</p><p className="text-2xl font-bold text-chart-2">{totalKeluar}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
              <Calendar className="h-6 w-6 text-chart-3" />
            </div>
            <div><p className="text-sm text-muted-foreground">Total Transaksi</p><p className="text-2xl font-bold text-chart-3">{transactions.length}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>{filteredTransactions.length} transaksi ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari transaksi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-secondary pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px] bg-secondary"><SelectValue placeholder="Tipe" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="masuk">Masuk</SelectItem>
                <SelectItem value="keluar">Keluar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Tanggal</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Produk</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Tipe</th>
                <th className="text-right text-xs font-medium text-muted-foreground pb-3">Jumlah</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Operator</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="border-b border-border">
                  <td className="py-3 font-mono text-xs">{t.id}</td>
                  <td className="py-3 text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} {t.time}</td>
                  <td className="py-3 font-medium text-sm max-w-[200px] truncate">{t.product}</td>
                  <td className="py-3"><Badge className={cn("text-xs", t.type === "masuk" ? "bg-primary/10 text-primary" : "bg-chart-2/10 text-chart-2")}>{t.type === "masuk" ? "Masuk" : "Keluar"}</Badge></td>
                  <td className={cn("py-3 text-right font-medium text-sm", t.type === "masuk" ? "text-primary" : "text-chart-2")}>{t.type === "masuk" ? "+" : "-"}{t.quantity}</td>
                  <td className="py-3 text-xs text-muted-foreground">{t.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )

  // Mobile Content - Compact
  const MobileContent = () => (
    <div className="space-y-2.5">
      {/* Mini Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        <Card><CardContent className="p-2 text-center"><p className="text-[9px] text-muted-foreground">Masuk</p><p className="text-sm font-bold text-primary">{totalMasuk}</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><p className="text-[9px] text-muted-foreground">Keluar</p><p className="text-sm font-bold text-chart-2">{totalKeluar}</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><p className="text-[9px] text-muted-foreground">Total</p><p className="text-sm font-bold text-chart-3">{transactions.length}</p></CardContent></Card>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8 bg-secondary pl-7 text-xs" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[80px] h-8 bg-secondary text-xs"><SelectValue placeholder="Tipe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="masuk">Masuk</SelectItem>
            <SelectItem value="keluar">Keluar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction Cards */}
      <div className="space-y-1.5">
        {filteredTransactions.map((t) => (
          <Card key={t.id} className="bg-card">
            <CardContent className="p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[11px] truncate">{t.product}</p>
                  <p className="text-[9px] text-muted-foreground">{new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} {t.time}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[11px] font-semibold", t.type === "masuk" ? "text-primary" : "text-chart-2")}>{t.type === "masuk" ? "+" : "-"}{t.quantity}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <AppLayout
        title="Transaksi"
        subtitle="Riwayat barang masuk dan keluar"
        desktopActions={<DesktopActions />}
        mobileActions={<MobileActions />}
        desktopContent={<DesktopContent />}
        mobileContent={<MobileContent />}
      />

      {/* Add Transaction Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className="w-full sm:max-w-md bg-card border-border">
          <SheetHeader><SheetTitle>Tambah Transaksi</SheetTitle><SheetDescription>Catat transaksi barang</SheetDescription></SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Produk</Label>
              <Select value={formData.productId} onValueChange={(v) => setFormData({ ...formData, productId: v })}>
                <SelectTrigger className="bg-secondary"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Tipe</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="masuk">Masuk</SelectItem><SelectItem value="keluar">Keluar</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-sm">Jumlah</Label><Input type="number" placeholder="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} className="bg-secondary" /></div>
            <div className="space-y-2"><Label className="text-sm">Operator</Label><Input placeholder="Nama" value={formData.operator} onChange={(e) => setFormData({ ...formData, operator: e.target.value })} className="bg-secondary" /></div>
            <div className="space-y-2"><Label className="text-sm">Catatan</Label><Input placeholder="Optional" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="bg-secondary" /></div>
          </div>
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} size="sm">Batal</Button>
            <Button onClick={handleSave} size="sm" disabled={!formData.productId || formData.quantity <= 0}><Save className="mr-2 h-4 w-4" />Simpan</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
