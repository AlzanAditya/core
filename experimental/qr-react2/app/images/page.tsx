"use client"

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { AppLayout } from "@/components/layouts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  clearProductImage,
  countProductImages,
  getAllProducts,
  Product,
  productImageSlots,
  ProductImageSlot,
  uploadProductImage,
} from "@/lib/qr-api"
import { ImageIcon, RefreshCw, Search, Trash2, Upload } from "lucide-react"

export default function ImagesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [busySlot, setBusySlot] = useState("")
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return products
    return products.filter((product) =>
      `${product.nama_produk} ${product.nomor_seri} ${product.tipe_kode || ""}`.toLowerCase().includes(q)
    )
  }, [products, searchQuery])

  async function loadProducts() {
    try {
      setLoading(true)
      setError("")
      setProducts(await getAllProducts())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat gambar.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const slotKey = (nomorSeri: string, slot: ProductImageSlot) => `${nomorSeri}-${slot}`

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>, product: Product, slot: ProductImageSlot) => {
    const file = event.target.files?.[0]
    if (!file) return

    const key = slotKey(product.nomor_seri, slot)
    try {
      setBusySlot(key)
      const url = await uploadProductImage(file, product.nomor_seri, slot)
      setProducts((current) =>
        current.map((item) =>
          item.nomor_seri === product.nomor_seri ? { ...item, [`gambar_${slot}`]: `${url}?t=${Date.now()}` } : item
        )
      )
      toast.success(`Foto ${slot} berhasil diupload.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload gagal.")
    } finally {
      setBusySlot("")
      event.target.value = ""
    }
  }

  const handleDelete = async (product: Product, slot: ProductImageSlot) => {
    const key = slotKey(product.nomor_seri, slot)
    try {
      setBusySlot(key)
      await clearProductImage(product.nomor_seri, slot)
      setProducts((current) =>
        current.map((item) =>
          item.nomor_seri === product.nomor_seri ? { ...item, [`gambar_${slot}`]: null } : item
        )
      )
      toast.success(`Foto ${slot} dihapus dari produk.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus foto.")
    } finally {
      setBusySlot("")
    }
  }

  const Content = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-icon="inline-start" />
              <Input placeholder="Cari produk..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="bg-secondary pl-9" />
            </div>
            <Button variant="outline" onClick={loadProducts}>
              <RefreshCw data-icon="inline-start" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="flex h-56 items-center justify-center"><Spinner /></CardContent></Card>
      ) : error ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><ImageIcon /></EmptyMedia>
            <EmptyTitle>Gagal memuat gambar</EmptyTitle>
            <EmptyDescription>{error}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filteredProducts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><ImageIcon /></EmptyMedia>
            <EmptyTitle>Belum ada produk</EmptyTitle>
            <EmptyDescription>Slot gambar akan muncul setelah produk tersedia di Supabase.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.nomor_seri}>
              <CardHeader className={compact ? "p-3 pb-2" : "pb-4"}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <CardTitle className={compact ? "truncate text-sm" : "truncate"}>{product.nama_produk}</CardTitle>
                    <CardDescription className="font-mono">{product.nomor_seri}</CardDescription>
                  </div>
                  <Badge variant={countProductImages(product) === 4 ? "default" : "secondary"}>
                    {countProductImages(product)}/4 foto
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className={compact ? "grid grid-cols-2 gap-2 p-3 pt-0" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"}>
                {productImageSlots(product).map(({ slot, label, url }) => {
                  const key = slotKey(product.nomor_seri, slot)
                  const busy = busySlot === key
                  return (
                    <div key={slot} className="overflow-hidden rounded-lg border bg-secondary">
                      <div className="relative aspect-[4/3] bg-muted">
                        {url ? (
                          <img src={url} alt={`${product.nama_produk} ${label}`} className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ImageIcon data-icon="inline-start" />
                            <span className="text-xs">{label}</span>
                          </div>
                        )}
                        {busy && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                            <Spinner />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2">
                        <span className="text-xs font-medium">{label}</span>
                        <div className="flex gap-1">
                          <Input
                            ref={(node) => {
                              inputRefs.current[key] = node
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => handleUpload(event, product, slot)}
                          />
                          <Button variant="outline" size="icon" onClick={() => inputRefs.current[key]?.click()} disabled={busy}>
                            <Upload data-icon="inline-start" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product, slot)} disabled={busy || !url}>
                            <Trash2 data-icon="inline-start" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <AppLayout
      title="Images"
      subtitle="Kelola gambar produk di Supabase Storage"
      desktopContent={<Content />}
      mobileContent={<Content compact />}
    />
  )
}
