"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { AppLayout } from "@/components/layouts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, Copy, Plus, QrCode, Check } from "lucide-react"

const existingProducts = [
  { id: "PRD001", name: "PowerShield Ultra 5000VA", sku: "SN-UPS-20240101", location: "Rak A-01", stock: 25 },
  { id: "PRD002", name: "StabilVolt Pro 3000", sku: "SN-STB-20240215", location: "Rak B-03", stock: 8 },
  { id: "PRD003", name: "UPS Compact 1500VA", sku: "SN-UPS-20230901", location: "Rak A-02", stock: 0 },
  { id: "PRD004", name: "Inverter Pure Sine 2000W", sku: "SN-INV-20240310", location: "Rak C-01", stock: 45 },
  { id: "PRD005", name: "Stabilizer Industrial 10KVA", sku: "SN-STB-20240520", location: "Rak B-05", stock: 12 },
]

export default function QRCodePage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [customData, setCustomData] = useState("")
  const [qrSize, setQrSize] = useState("200")
  const [generatedQR, setGeneratedQR] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerateQR = () => {
    if (selectedProduct) {
      const product = existingProducts.find((p) => p.id === selectedProduct)
      if (product) setGeneratedQR(JSON.stringify({ id: product.id, name: product.name, sku: product.sku, location: product.location }))
    } else if (customData) {
      setGeneratedQR(customData)
    }
  }

  const handleDownload = () => {
    const svg = document.getElementById("qr-code")
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        canvas.width = parseInt(qrSize)
        canvas.height = parseInt(qrSize)
        ctx?.drawImage(img, 0, 0)
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `qr-code-${selectedProduct || "custom"}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }
  }

  const handleCopy = async () => {
    if (generatedQR) {
      await navigator.clipboard.writeText(generatedQR)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    const printContent = document.getElementById("qr-code")
    if (printContent) {
      const printWindow = window.open("", "", "width=400,height=400")
      if (printWindow) {
        printWindow.document.write(`<html><head><title>Print QR</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">${printContent.outerHTML}</body></html>`)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const quickGenerate = (product: typeof existingProducts[0]) => {
    setSelectedProduct(product.id)
    setCustomData("")
    setGeneratedQR(JSON.stringify({ id: product.id, name: product.name, sku: product.sku, location: product.location }))
  }

  // Desktop Content
  const DesktopContent = () => (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Generator Form */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-primary" />Buat QR Code</CardTitle>
            <CardDescription>Pilih produk atau masukkan data kustom</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pilih Produk</Label>
              <Select onValueChange={(value) => { setSelectedProduct(value); setCustomData("") }}>
                <SelectTrigger className="bg-secondary"><SelectValue placeholder="Pilih dari inventaris" /></SelectTrigger>
                <SelectContent>{existingProducts.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">atau</span></div></div>
            <div className="space-y-2"><Label>Data Kustom</Label><Input placeholder="Masukkan teks atau URL" value={customData} onChange={(e) => { setCustomData(e.target.value); setSelectedProduct(null) }} className="bg-secondary" /></div>
            <div className="space-y-2">
              <Label>Ukuran QR Code</Label>
              <Select value={qrSize} onValueChange={setQrSize}>
                <SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="150">150 x 150 px</SelectItem><SelectItem value="200">200 x 200 px</SelectItem><SelectItem value="256">256 x 256 px</SelectItem><SelectItem value="300">300 x 300 px</SelectItem></SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateQR} className="w-full" disabled={!selectedProduct && !customData}><Plus className="mr-2 h-4 w-4" />Generate QR Code</Button>
          </CardContent>
        </Card>

        {/* QR Preview */}
        <Card>
          <CardHeader className="pb-4"><CardTitle>Preview QR Code</CardTitle><CardDescription>Hasil QR code yang telah di-generate</CardDescription></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              {generatedQR ? (
                <>
                  <div className="rounded-lg bg-secondary p-6"><QRCodeSVG id="qr-code" value={generatedQR} size={parseInt(qrSize)} bgColor="transparent" fgColor="oklch(0.98 0 0)" level="H" includeMargin={false} /></div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Download</Button>
                    <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
                    <Button variant="outline" size="sm" onClick={handleCopy}>{copied ? <Check className="mr-2 h-4 w-4 text-primary" /> : <Copy className="mr-2 h-4 w-4" />}{copied ? "Copied!" : "Copy"}</Button>
                  </div>
                  <div className="w-full rounded-lg bg-secondary p-3"><p className="break-all font-mono text-xs text-muted-foreground">{generatedQR}</p></div>
                </>
              ) : (
                <div className="flex h-[280px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border"><QrCode className="mb-2 h-10 w-10 text-muted-foreground" /><p className="text-sm text-muted-foreground">QR code akan muncul di sini</p></div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product List Table */}
      <Card>
        <CardHeader className="pb-4"><CardTitle>Daftar Produk</CardTitle><CardDescription>Klik untuk generate QR code</CardDescription></CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Nama</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">SKU</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Lokasi</th>
                <th className="text-right text-xs font-medium text-muted-foreground pb-3">Stok</th>
                <th className="text-right text-xs font-medium text-muted-foreground pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {existingProducts.map((p) => (
                <tr key={p.id} className="border-b border-border">
                  <td className="py-3 font-mono text-xs">{p.id}</td>
                  <td className="py-3 font-medium text-sm">{p.name}</td>
                  <td className="py-3"><Badge variant="secondary" className="font-mono text-xs">{p.sku}</Badge></td>
                  <td className="py-3 text-xs text-muted-foreground">{p.location}</td>
                  <td className="py-3 text-right font-medium">{p.stock}</td>
                  <td className="py-3 text-right"><Button variant="ghost" size="sm" onClick={() => quickGenerate(p)}><QrCode className="h-4 w-4" /></Button></td>
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
      {/* Generator Form - Compact */}
      <Card>
        <CardHeader className="p-2.5 pb-1.5"><CardTitle className="text-xs flex items-center gap-1"><QrCode className="h-3.5 w-3.5 text-primary" />Buat QR Code</CardTitle></CardHeader>
        <CardContent className="p-2.5 pt-0 space-y-2">
          <Select onValueChange={(value) => { setSelectedProduct(value); setCustomData("") }}>
            <SelectTrigger className="h-8 bg-secondary text-xs"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
            <SelectContent>{existingProducts.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Atau masukkan data kustom" value={customData} onChange={(e) => { setCustomData(e.target.value); setSelectedProduct(null) }} className="h-8 bg-secondary text-xs" />
          <Button onClick={handleGenerateQR} size="sm" className="w-full h-8 text-xs" disabled={!selectedProduct && !customData}><Plus className="mr-1 h-3.5 w-3.5" />Generate</Button>
        </CardContent>
      </Card>

      {/* QR Preview - Compact */}
      {generatedQR && (
        <Card>
          <CardContent className="p-2.5">
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-lg bg-secondary p-3"><QRCodeSVG id="qr-code" value={generatedQR} size={120} bgColor="transparent" fgColor="oklch(0.98 0 0)" level="H" includeMargin={false} /></div>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={handleDownload}><Download className="h-3 w-3" /></Button>
                <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={handlePrint}><Printer className="h-3 w-3" /></Button>
                <Button variant="outline" size="sm" className="h-7 text-[10px] px-2" onClick={handleCopy}>{copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product List - Compact Cards */}
      <Card>
        <CardHeader className="p-2.5 pb-1.5"><CardTitle className="text-xs">Produk</CardTitle></CardHeader>
        <CardContent className="p-2.5 pt-0 space-y-1.5">
          {existingProducts.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[11px] truncate">{p.name}</p>
                <p className="text-[9px] text-muted-foreground">{p.sku}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => quickGenerate(p)}><QrCode className="h-3 w-3" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <AppLayout
      title="QR Code Generator"
      subtitle="Buat dan kelola QR code untuk produk"
      desktopContent={<DesktopContent />}
      mobileContent={<MobileContent />}
    />
  )
}
