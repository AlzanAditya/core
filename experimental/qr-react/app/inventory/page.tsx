"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layouts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Search, Plus, Edit, Trash2, Save } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoreHorizontal } from "lucide-react"

interface Product {
  id: string
  namaProduk: string
  tipeKode: string
  nomorSeri: string
  tahunPembuatan: string
  inputTegangan: string
  outputTegangan: string
  frekuensi: string
  jumlahSocket: string
  rangeDaya: string
  softFuse: string
  hardFuse: string
  groundOutput: string
  tambahan: string
  stock: number
  minStock: number
  status: "normal" | "low" | "out"
}

const initialProducts: Product[] = [
  { id: "PRD001", namaProduk: "PowerShield Ultra 5000VA", tipeKode: "Online DC", nomorSeri: "SN-UPS-20240101", tahunPembuatan: "2024", inputTegangan: "100-300VAC", outputTegangan: "220VAC ±3%", frekuensi: "50Hz", jumlahSocket: "4", rangeDaya: "5000VA", softFuse: "16A", hardFuse: "20A", groundOutput: "Yes", tambahan: "LCD Display", stock: 25, minStock: 10, status: "normal" },
  { id: "PRD002", namaProduk: "StabilVolt Pro 3000", tipeKode: "Offline", nomorSeri: "SN-STB-20240215", tahunPembuatan: "2024", inputTegangan: "160-250VAC", outputTegangan: "220VAC ±5%", frekuensi: "50Hz", jumlahSocket: "6", rangeDaya: "3000VA", softFuse: "12A", hardFuse: "16A", groundOutput: "Yes", tambahan: "Digital Display", stock: 8, minStock: 15, status: "low" },
  { id: "PRD003", namaProduk: "UPS Compact 1500VA", tipeKode: "Line Interactive", nomorSeri: "SN-UPS-20230901", tahunPembuatan: "2023", inputTegangan: "170-280VAC", outputTegangan: "220VAC ±2%", frekuensi: "50/60Hz", jumlahSocket: "4", rangeDaya: "1500VA", softFuse: "8A", hardFuse: "10A", groundOutput: "No", tambahan: "USB Port", stock: 0, minStock: 20, status: "out" },
  { id: "PRD004", namaProduk: "Inverter Pure Sine 2000W", tipeKode: "Pure Sine Wave", nomorSeri: "SN-INV-20240310", tahunPembuatan: "2024", inputTegangan: "12VDC/24VDC", outputTegangan: "220VAC ±3%", frekuensi: "50Hz", jumlahSocket: "2", rangeDaya: "2000W", softFuse: "10A", hardFuse: "15A", groundOutput: "Yes", tambahan: "Low Battery Alarm", stock: 45, minStock: 15, status: "normal" },
  { id: "PRD005", namaProduk: "Stabilizer Industrial 10KVA", tipeKode: "Servo Motor", nomorSeri: "SN-STB-20240520", tahunPembuatan: "2024", inputTegangan: "150-250VAC", outputTegangan: "220VAC ±1%", frekuensi: "50Hz", jumlahSocket: "1", rangeDaya: "10000VA", softFuse: "40A", hardFuse: "50A", groundOutput: "Yes", tambahan: "Bypass Switch", stock: 12, minStock: 5, status: "normal" },
]

const emptyProduct = { namaProduk: "", tipeKode: "", nomorSeri: "", tahunPembuatan: "", inputTegangan: "", outputTegangan: "", frekuensi: "", jumlahSocket: "", rangeDaya: "", softFuse: "", hardFuse: "", groundOutput: "", tambahan: "", stock: 0, minStock: 10 }

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState(emptyProduct)

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.namaProduk.toLowerCase().includes(searchQuery.toLowerCase()) || p.nomorSeri.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = { normal: "bg-primary/10 text-primary", low: "bg-chart-3/10 text-chart-3", out: "bg-destructive/10 text-destructive" }
    const labels = { normal: "Normal", low: "Menipis", out: "Habis" }
    return <Badge className={styles[status as keyof typeof styles]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const handleAdd = () => { setFormData(emptyProduct); setIsAddOpen(true) }
  const handleEdit = (product: Product) => { setFormData(product); setEditProduct(product) }
  const handleDelete = (id: string) => setProducts(products.filter(p => p.id !== id))
  const getStatus = (stock: number, minStock: number): "normal" | "low" | "out" => stock === 0 ? "out" : stock < minStock ? "low" : "normal"

  const handleSave = () => {
    if (editProduct) {
      setProducts(products.map(p => p.id === editProduct.id ? { ...formData, id: p.id, status: getStatus(formData.stock, formData.minStock) } as Product : p))
      setEditProduct(null)
    } else {
      const newId = `PRD${String(products.length + 1).padStart(3, "0")}`
      setProducts([...products, { ...formData, id: newId, status: getStatus(formData.stock, formData.minStock) }])
      setIsAddOpen(false)
    }
    setFormData(emptyProduct)
  }

  // Desktop Actions
  const DesktopActions = () => (
    <Button onClick={handleAdd}>
      <Plus className="mr-2 h-4 w-4" />
      Tambah Produk
    </Button>
  )

  // Mobile Actions
  const MobileActions = () => (
    <Button onClick={handleAdd} size="sm" className="w-full h-8 text-xs">
      <Plus className="mr-1 h-3.5 w-3.5" />
      Tambah Produk
    </Button>
  )

  // Desktop Content
  const DesktopContent = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Produk</p><p className="text-2xl font-bold">{products.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Stok Normal</p><p className="text-2xl font-bold text-primary">{products.filter(p => p.status === "normal").length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Stok Menipis</p><p className="text-2xl font-bold text-chart-3">{products.filter(p => p.status === "low").length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Stok Habis</p><p className="text-2xl font-bold text-destructive">{products.filter(p => p.status === "out").length}</p></CardContent></Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>{filteredProducts.length} produk ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-secondary pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-secondary"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Menipis</SelectItem>
                <SelectItem value="out">Habis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Produk</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Serial</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                <th className="text-right text-xs font-medium text-muted-foreground pb-3">Stok</th>
                <th className="text-right text-xs font-medium text-muted-foreground pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-b border-border">
                  <td className="py-3 font-mono text-xs">{p.id}</td>
                  <td className="py-3 font-medium text-sm max-w-[200px] truncate">{p.namaProduk}</td>
                  <td className="py-3 text-xs text-muted-foreground">{p.nomorSeri}</td>
                  <td className="py-3">{getStatusBadge(p.status)}</td>
                  <td className="py-3 text-right font-medium">{p.stock}</td>
                  <td className="py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(p)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Hapus</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )

  // Mobile Content - Compact cards optimized for touch
  const MobileContent = () => (
    <div className="space-y-2.5">
      {/* Mini Stats */}
      <div className="grid grid-cols-4 gap-1.5">
        <Card><CardContent className="p-2 text-center"><p className="text-[9px] text-muted-foreground">Total</p><p className="text-sm font-bold">{products.length}</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><p className="text-[9px] text-muted-foreground">Normal</p><p className="text-sm font-bold text-primary">{products.filter(p => p.status === "normal").length}</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><p className="text-[9px] text-muted-foreground">Menipis</p><p className="text-sm font-bold text-chart-3">{products.filter(p => p.status === "low").length}</p></CardContent></Card>
        <Card><CardContent className="p-2 text-center"><p className="text-[9px] text-muted-foreground">Habis</p><p className="text-sm font-bold text-destructive">{products.filter(p => p.status === "out").length}</p></CardContent></Card>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8 bg-secondary pl-7 text-xs" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[90px] h-8 bg-secondary text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Menipis</SelectItem>
            <SelectItem value="out">Habis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product Cards */}
      <div className="space-y-1.5">
        {filteredProducts.map((p) => (
          <Card key={p.id} className="bg-card">
            <CardContent className="p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[11px] truncate">{p.namaProduk}</p>
                  <p className="text-[9px] text-muted-foreground">{p.nomorSeri}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[11px] font-semibold", p.status === "out" ? "text-destructive" : p.status === "low" ? "text-chart-3" : "")}>{p.stock}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3 w-3" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(p)}><Edit className="mr-2 h-3 w-3" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-destructive"><Trash2 className="mr-2 h-3 w-3" />Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  // Product Form (shared)
  const ProductForm = () => (
    <ScrollArea className="h-[60vh] pr-4">
      <div className="space-y-4 pb-4">
        <div className="space-y-3">
          <h4 className="text-xs font-semibold">Info Produk</h4>
          <div className="space-y-2">
            <Label className="text-xs">Nama Produk *</Label>
            <Input placeholder="cth. PowerShield Ultra 5000VA" value={formData.namaProduk} onChange={(e) => setFormData({ ...formData, namaProduk: e.target.value })} className="bg-secondary text-sm h-9" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2"><Label className="text-xs">Tipe/Kode</Label><Input placeholder="cth. Online DC" value={formData.tipeKode} onChange={(e) => setFormData({ ...formData, tipeKode: e.target.value })} className="bg-secondary text-sm h-9" /></div>
            <div className="space-y-2"><Label className="text-xs">Nomor Seri *</Label><Input placeholder="cth. SN-UPS-001" value={formData.nomorSeri} onChange={(e) => setFormData({ ...formData, nomorSeri: e.target.value })} className="bg-secondary text-sm h-9" /></div>
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <h4 className="text-xs font-semibold">Spesifikasi</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2"><Label className="text-xs">Input Tegangan</Label><Input placeholder="100-300VAC" value={formData.inputTegangan} onChange={(e) => setFormData({ ...formData, inputTegangan: e.target.value })} className="bg-secondary text-sm h-9" /></div>
            <div className="space-y-2"><Label className="text-xs">Output Tegangan</Label><Input placeholder="220VAC ±3%" value={formData.outputTegangan} onChange={(e) => setFormData({ ...formData, outputTegangan: e.target.value })} className="bg-secondary text-sm h-9" /></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2"><Label className="text-xs">Frekuensi</Label><Input placeholder="50Hz" value={formData.frekuensi} onChange={(e) => setFormData({ ...formData, frekuensi: e.target.value })} className="bg-secondary text-sm h-9" /></div>
            <div className="space-y-2"><Label className="text-xs">Socket</Label><Input placeholder="4" value={formData.jumlahSocket} onChange={(e) => setFormData({ ...formData, jumlahSocket: e.target.value })} className="bg-secondary text-sm h-9" /></div>
            <div className="space-y-2"><Label className="text-xs">Daya</Label><Input placeholder="5000VA" value={formData.rangeDaya} onChange={(e) => setFormData({ ...formData, rangeDaya: e.target.value })} className="bg-secondary text-sm h-9" /></div>
          </div>
        </div>
        <Separator />
        <div className="space-y-3">
          <h4 className="text-xs font-semibold">Stok</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2"><Label className="text-xs">Stok Saat Ini</Label><Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} className="bg-secondary text-sm h-9" /></div>
            <div className="space-y-2"><Label className="text-xs">Min. Stok</Label><Input type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })} className="bg-secondary text-sm h-9" /></div>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label className="text-xs">Catatan Tambahan</Label>
          <Textarea placeholder="Info tambahan..." value={formData.tambahan} onChange={(e) => setFormData({ ...formData, tambahan: e.target.value })} className="bg-secondary text-sm min-h-[60px]" />
        </div>
      </div>
    </ScrollArea>
  )

  return (
    <>
      <AppLayout
        title="Products"
        subtitle="Kelola semua produk di gudang"
        desktopActions={<DesktopActions />}
        mobileActions={<MobileActions />}
        desktopContent={<DesktopContent />}
        mobileContent={<MobileContent />}
      />

      {/* Add Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className="w-full sm:max-w-md bg-card border-border">
          <SheetHeader><SheetTitle>Tambah Produk</SheetTitle><SheetDescription>Masukkan detail produk baru</SheetDescription></SheetHeader>
          <div className="py-4"><ProductForm /></div>
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} size="sm">Batal</Button>
            <Button onClick={handleSave} size="sm"><Save className="mr-2 h-4 w-4" />Simpan</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Edit Sheet */}
      <Sheet open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <SheetContent className="w-full sm:max-w-md bg-card border-border">
          <SheetHeader><SheetTitle>Edit Produk</SheetTitle><SheetDescription>Ubah detail produk</SheetDescription></SheetHeader>
          <div className="py-4"><ProductForm /></div>
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditProduct(null)} size="sm">Batal</Button>
            <Button onClick={handleSave} size="sm"><Save className="mr-2 h-4 w-4" />Simpan</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
