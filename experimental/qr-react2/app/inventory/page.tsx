"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { AppLayout } from "@/components/layouts"
import { DataPagination } from "@/components/data-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  countProductImages,
  createProduct,
  deleteProduct,
  emptyProductForm,
  formatDateTime,
  getProductPublicUrl,
  getProducts,
  Product,
  ProductFormData,
  productToForm,
  updateProduct,
} from "@/lib/qr-api"
import { ExternalLink, ImageIcon, MoreHorizontal, Package, Pencil, Plus, Search, Save, Trash2 } from "lucide-react"

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyProductForm)
  const [saving, setSaving] = useState(false)

  const imageComplete = useMemo(() => products.filter((product) => countProductImages(product) === 4).length, [products])
  const imagePartial = useMemo(() => products.filter((product) => {
    const count = countProductImages(product)
    return count > 0 && count < 4
  }).length, [products])

  async function loadProducts() {
    try {
      setLoading(true)
      setError("")
      const result = await getProducts({ page, pageSize, search: searchQuery })
      setProducts(result.data)
      setTotal(result.count)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memuat produk."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [page, pageSize, searchQuery])

  useEffect(() => {
    if (new URL(window.location.href).searchParams.get("action") === "add") {
      setIsAddOpen(true)
    }
  }, [])

  const openAdd = () => {
    setFormData(emptyProductForm)
    setIsAddOpen(true)
  }

  const openEdit = (product: Product) => {
    setFormData(productToForm(product))
    setEditProduct(product)
  }

  const handleSave = async () => {
    if (!formData.nomor_seri.trim() || !formData.nama_produk.trim()) {
      toast.error("Nomor seri dan nama produk wajib diisi.")
      return
    }

    try {
      setSaving(true)
      if (editProduct) {
        await updateProduct(editProduct.nomor_seri, formData)
        toast.success("Produk berhasil diperbarui.")
        setEditProduct(null)
      } else {
        await createProduct(formData)
        toast.success("Produk berhasil dibuat.")
        setIsAddOpen(false)
      }
      setFormData(emptyProductForm)
      await loadProducts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan produk.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Hapus produk ${product.nomor_seri}?`)) return
    try {
      await deleteProduct(product.nomor_seri)
      toast.success("Produk berhasil dihapus.")
      await loadProducts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus produk.")
    }
  }

  const ProductForm = () => (
    <ScrollArea className="h-[62vh] pr-4">
      <div className="flex flex-col gap-4 pb-4">
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold">Info Produk</h4>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nama_produk" className="text-xs">Nama Produk *</Label>
            <Input id="nama_produk" value={formData.nama_produk} onChange={(event) => setFormData({ ...formData, nama_produk: event.target.value })} className="bg-secondary" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tipe_kode" className="text-xs">Tipe/Kode</Label>
              <Input id="tipe_kode" value={formData.tipe_kode} onChange={(event) => setFormData({ ...formData, tipe_kode: event.target.value })} className="bg-secondary" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nomor_seri" className="text-xs">Nomor Seri *</Label>
              <Input id="nomor_seri" value={formData.nomor_seri} onChange={(event) => setFormData({ ...formData, nomor_seri: event.target.value })} className="bg-secondary" disabled={Boolean(editProduct)} />
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold">Spesifikasi</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tahun" className="text-xs">Tahun</Label>
              <Input id="tahun" inputMode="numeric" value={formData.tahun_pembuatan} onChange={(event) => setFormData({ ...formData, tahun_pembuatan: event.target.value })} className="bg-secondary" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="frekuensi" className="text-xs">Frekuensi</Label>
              <Input id="frekuensi" value={formData.frekuensi} onChange={(event) => setFormData({ ...formData, frekuensi: event.target.value })} className="bg-secondary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="input" className="text-xs">Input</Label>
              <Input id="input" value={formData.input} onChange={(event) => setFormData({ ...formData, input: event.target.value })} className="bg-secondary" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="output" className="text-xs">Output</Label>
              <Input id="output" value={formData.output} onChange={(event) => setFormData({ ...formData, output: event.target.value })} className="bg-secondary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="jumlah_socket" className="text-xs">Jumlah Socket</Label>
              <Input id="jumlah_socket" inputMode="numeric" value={formData.jumlah_socket} onChange={(event) => setFormData({ ...formData, jumlah_socket: event.target.value })} className="bg-secondary" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="range_daya" className="text-xs">Range Daya</Label>
              <Input id="range_daya" value={formData.range_daya} onChange={(event) => setFormData({ ...formData, range_daya: event.target.value })} className="bg-secondary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="soft_fuse" className="text-xs">Soft Fuse</Label>
              <Input id="soft_fuse" value={formData.soft_fuse_protection} onChange={(event) => setFormData({ ...formData, soft_fuse_protection: event.target.value })} className="bg-secondary" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hard_fuse" className="text-xs">Hard Fuse</Label>
              <Input id="hard_fuse" value={formData.hard_fuse_protection} onChange={(event) => setFormData({ ...formData, hard_fuse_protection: event.target.value })} className="bg-secondary" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ground_output" className="text-xs">Ground Output</Label>
            <Input id="ground_output" value={formData.ground_output} onChange={(event) => setFormData({ ...formData, ground_output: event.target.value })} className="bg-secondary" />
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <Label htmlFor="tambahan_optional" className="text-xs">Tambahan Optional</Label>
          <Textarea id="tambahan_optional" value={formData.tambahan_optional} onChange={(event) => setFormData({ ...formData, tambahan_optional: event.target.value })} className="min-h-[80px] bg-secondary" />
        </div>
      </div>
    </ScrollArea>
  )

  const ProductTable = ({ compact = false }: { compact?: boolean }) => (
    <Card>
      <CardHeader className={compact ? "p-3 pb-2" : "pb-4"}>
        <CardTitle className={compact ? "text-sm" : undefined}>Daftar Produk</CardTitle>
        <CardDescription>{total} produk dari Supabase</CardDescription>
      </CardHeader>
      <CardContent className={compact ? "p-3 pt-0" : undefined}>
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-icon="inline-start" />
            <Input
              placeholder="Cari produk atau nomor seri..."
              value={searchQuery}
              onChange={(event) => {
                setPage(1)
                setSearchQuery(event.target.value)
              }}
              className="bg-secondary pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><Package /></EmptyMedia>
              <EmptyTitle>Gagal memuat produk</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" onClick={loadProducts}>Coba Lagi</Button>
          </Empty>
        ) : products.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><Package /></EmptyMedia>
              <EmptyTitle>Belum ada produk</EmptyTitle>
              <EmptyDescription>Data produk akan muncul setelah tersimpan di Supabase.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : compact ? (
          <div className="flex flex-col gap-2">
            {products.map((product) => (
              <Card key={product.nomor_seri}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{product.nama_produk}</p>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">{product.nomor_seri}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                      <Pencil data-icon="inline-start" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Seri</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Tahun</TableHead>
                <TableHead>Foto</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const imageCount = countProductImages(product)
                return (
                  <TableRow key={product.nomor_seri}>
                    <TableCell className="font-mono text-xs">{product.nomor_seri}</TableCell>
                    <TableCell className="max-w-[260px] truncate font-medium">{product.nama_produk}</TableCell>
                    <TableCell>{product.tipe_kode || "-"}</TableCell>
                    <TableCell>{product.tahun_pembuatan || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={imageCount === 4 ? "default" : imageCount > 0 ? "secondary" : "outline"}>
                        {imageCount}/4 foto
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(product.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal data-icon="inline-start" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(getProductPublicUrl(product.nomor_seri), "_blank")}>
                            <ExternalLink data-icon="inline-start" />
                            Public
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(product)}>
                            <Pencil data-icon="inline-start" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product)}>
                            <Trash2 data-icon="inline-start" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
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

  const Stats = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? "grid grid-cols-3 gap-1.5" : "grid grid-cols-3 gap-4"}>
      <Card>
        <CardContent className={compact ? "p-2 text-center" : "p-4"}>
          <p className="text-xs text-muted-foreground">Total Produk</p>
          <p className={compact ? "text-lg font-bold" : "text-2xl font-bold"}>{total}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className={compact ? "p-2 text-center" : "p-4"}>
          <p className="text-xs text-muted-foreground">Foto Lengkap</p>
          <p className={compact ? "text-lg font-bold text-primary" : "text-2xl font-bold text-primary"}>{imageComplete}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className={compact ? "p-2 text-center" : "p-4"}>
          <p className="text-xs text-muted-foreground">Perlu Foto</p>
          <p className={compact ? "text-lg font-bold text-chart-3" : "text-2xl font-bold text-chart-3"}>{Math.max(total - imageComplete - imagePartial, 0)}</p>
        </CardContent>
      </Card>
    </div>
  )

  const DesktopContent = () => (
    <div className="flex flex-col gap-6">
      <Stats />
      <ProductTable />
    </div>
  )

  const MobileContent = () => (
    <div className="flex flex-col gap-2.5">
      <Stats compact />
      <ProductTable compact />
    </div>
  )

  return (
    <>
      <AppLayout
        title="Products"
        subtitle="Kelola produk dari database Supabase"
        desktopActions={<Button onClick={openAdd}><Plus data-icon="inline-start" />Tambah Produk</Button>}
        mobileActions={<Button onClick={openAdd} size="sm" className="w-full"><Plus data-icon="inline-start" />Tambah Produk</Button>}
        desktopContent={<DesktopContent />}
        mobileContent={<MobileContent />}
      />

      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent className="w-full sm:max-w-md bg-card border-border">
          <SheetHeader>
            <SheetTitle>Tambah Produk</SheetTitle>
            <SheetDescription>Data akan disimpan ke Supabase lewat Worker apps/qr.</SheetDescription>
          </SheetHeader>
          <div className="py-4"><ProductForm /></div>
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} size="sm">Batal</Button>
            <Button onClick={handleSave} size="sm" disabled={saving}>
              {saving ? <Spinner /> : <Save data-icon="inline-start" />}
              Simpan
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(editProduct)} onOpenChange={(open) => !open && setEditProduct(null)}>
        <SheetContent className="w-full sm:max-w-md bg-card border-border">
          <SheetHeader>
            <SheetTitle>Edit Produk</SheetTitle>
            <SheetDescription>Perubahan mengikuti schema produk di apps/qr.</SheetDescription>
          </SheetHeader>
          <div className="py-4"><ProductForm /></div>
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditProduct(null)} size="sm">Batal</Button>
            <Button onClick={handleSave} size="sm" disabled={saving}>
              {saving ? <Spinner /> : <Save data-icon="inline-start" />}
              Simpan
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
