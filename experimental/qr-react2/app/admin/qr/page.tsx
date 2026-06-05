"use client"

import { useEffect, useMemo, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { AppLayout } from "@/components/layouts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAllProducts, getProductPublicUrl, Product } from "@/lib/qr-api"
import { Check, Copy, Download, ExternalLink, Plus, Printer, QrCode, Search } from "lucide-react"

export default function QRCodePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [customData, setCustomData] = useState("")
  const [qrSize, setQrSize] = useState("200")
  const [generatedQR, setGeneratedQR] = useState("")
  const [copied, setCopied] = useState(false)

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return products
    return products.filter((product) =>
      `${product.nama_produk} ${product.nomor_seri} ${product.tipe_kode || ""}`.toLowerCase().includes(q)
    )
  }, [products, searchQuery])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError("")
        setProducts(await getAllProducts())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat produk.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleGenerateQR = () => {
    if (selectedProduct) {
      setGeneratedQR(getProductPublicUrl(selectedProduct))
      return
    }
    if (customData.trim()) setGeneratedQR(customData.trim())
  }

  const handleDownload = () => {
    const svg = document.getElementById("qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const size = Number(qrSize)
      canvas.width = size
      canvas.height = size
      ctx?.drawImage(img, 0, 0)
      const downloadLink = document.createElement("a")
      downloadLink.download = `qr-${selectedProduct || "custom"}.png`
      downloadLink.href = canvas.toDataURL("image/png")
      downloadLink.click()
    }
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
  }

  const handleCopy = async () => {
    if (!generatedQR) return
    await navigator.clipboard.writeText(generatedQR)
    setCopied(true)
    toast.success("Link QR disalin.")
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    const printContent = document.getElementById("qr-code")
    if (!printContent) return

    const printWindow = window.open("", "", "width=420,height=420")
    if (!printWindow) return
    printWindow.document.write(`<html><head><title>Print QR</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">${printContent.outerHTML}</body></html>`)
    printWindow.document.close()
    printWindow.print()
  }

  const quickGenerate = (product: Product) => {
    setSelectedProduct(product.nomor_seri)
    setCustomData("")
    setGeneratedQR(getProductPublicUrl(product.nomor_seri))
  }

  const GeneratorCard = ({ compact = false }: { compact?: boolean }) => (
    <Card>
      <CardHeader className={compact ? "p-3 pb-2" : "pb-4"}>
        <CardTitle className={compact ? "flex items-center gap-2 text-sm" : "flex items-center gap-2"}>
          <QrCode data-icon="inline-start" />
          Buat QR Code
        </CardTitle>
        {!compact && <CardDescription>Pilih produk dari Supabase atau masukkan data kustom.</CardDescription>}
      </CardHeader>
      <CardContent className={compact ? "flex flex-col gap-2 p-3 pt-0" : "flex flex-col gap-4"}>
        <div className="flex flex-col gap-2">
          <Label>Pilih Produk</Label>
          <Select value={selectedProduct} onValueChange={(value) => { setSelectedProduct(value); setCustomData("") }}>
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="Pilih dari produk Supabase" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.nomor_seri} value={product.nomor_seri}>
                  {product.nama_produk}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Data Kustom</Label>
          <Input
            placeholder="Masukkan teks atau URL"
            value={customData}
            onChange={(event) => {
              setCustomData(event.target.value)
              setSelectedProduct("")
            }}
            className="bg-secondary"
          />
        </div>
        {!compact && (
          <div className="flex flex-col gap-2">
            <Label>Ukuran QR Code</Label>
            <Select value={qrSize} onValueChange={setQrSize}>
              <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="150">150 x 150 px</SelectItem>
                <SelectItem value="200">200 x 200 px</SelectItem>
                <SelectItem value="256">256 x 256 px</SelectItem>
                <SelectItem value="300">300 x 300 px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Button onClick={handleGenerateQR} disabled={!selectedProduct && !customData.trim()}>
          <Plus data-icon="inline-start" />
          Generate QR Code
        </Button>
      </CardContent>
    </Card>
  )

  const PreviewCard = ({ compact = false }: { compact?: boolean }) => (
    <Card>
      <CardHeader className={compact ? "p-3 pb-2" : "pb-4"}>
        <CardTitle className={compact ? "text-sm" : undefined}>Preview QR Code</CardTitle>
        {!compact && <CardDescription>QR produk berisi public URL yang sama dengan apps/qr.</CardDescription>}
      </CardHeader>
      <CardContent className={compact ? "p-3 pt-0" : undefined}>
        <div className="flex flex-col items-center gap-4">
          {generatedQR ? (
            <>
              <div className="rounded-lg bg-secondary p-5">
                <QRCodeSVG id="qr-code" value={generatedQR} size={compact ? 120 : Number(qrSize)} bgColor="transparent" fgColor="oklch(0.98 0 0)" level="H" includeMargin={false} />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}><Download data-icon="inline-start" />Download</Button>
                <Button variant="outline" size="sm" onClick={handlePrint}><Printer data-icon="inline-start" />Print</Button>
                <Button variant="outline" size="sm" onClick={handleCopy}>{copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}{copied ? "Copied" : "Copy"}</Button>
              </div>
              <div className="w-full rounded-lg bg-secondary p-3">
                <p className="break-all font-mono text-xs text-muted-foreground">{generatedQR}</p>
              </div>
            </>
          ) : (
            <Empty className="min-h-[240px]">
              <EmptyHeader>
                <EmptyMedia variant="icon"><QrCode /></EmptyMedia>
                <EmptyTitle>QR belum dibuat</EmptyTitle>
                <EmptyDescription>Pilih produk Supabase untuk membuat QR public URL.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const ProductsList = ({ compact = false }: { compact?: boolean }) => (
    <Card>
      <CardHeader className={compact ? "p-3 pb-2" : "pb-4"}>
        <CardTitle className={compact ? "text-sm" : undefined}>Daftar Produk</CardTitle>
        <CardDescription>{filteredProducts.length} produk tersedia</CardDescription>
      </CardHeader>
      <CardContent className={compact ? "p-3 pt-0" : undefined}>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-icon="inline-start" />
          <Input placeholder="Cari produk..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="bg-secondary pl-9" />
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center"><Spinner /></div>
        ) : error ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><QrCode /></EmptyMedia>
              <EmptyTitle>Gagal memuat produk</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : compact ? (
          <div className="flex flex-col gap-2">
            {filteredProducts.map((product) => (
              <div key={product.nomor_seri} className="flex items-center justify-between gap-3 rounded-md border p-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{product.nama_produk}</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">{product.nomor_seri}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => quickGenerate(product)}><QrCode data-icon="inline-start" /></Button>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Seri</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Public URL</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.nomor_seri}>
                  <TableCell><Badge variant="secondary" className="font-mono">{product.nomor_seri}</Badge></TableCell>
                  <TableCell className="max-w-[260px] truncate font-medium">{product.nama_produk}</TableCell>
                  <TableCell>{product.tipe_kode || "-"}</TableCell>
                  <TableCell className="max-w-[260px] truncate font-mono text-xs text-muted-foreground">{getProductPublicUrl(product.nomor_seri)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => quickGenerate(product)}><QrCode data-icon="inline-start" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => window.open(getProductPublicUrl(product.nomor_seri), "_blank")}><ExternalLink data-icon="inline-start" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )

  const DesktopContent = () => (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <GeneratorCard />
        <PreviewCard />
      </div>
      <ProductsList />
    </div>
  )

  const MobileContent = () => (
    <div className="flex flex-col gap-2.5">
      <GeneratorCard compact />
      <PreviewCard compact />
      <ProductsList compact />
    </div>
  )

  return (
    <AppLayout
      title="QR Code Generator"
      subtitle="Buat QR code produk dari Supabase"
      desktopContent={<DesktopContent />}
      mobileContent={<MobileContent />}
    />
  )
}
