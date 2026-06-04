"use client"

import { AppLayout } from "@/components/layouts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Bell, Shield, Database, Save, Download, FileSpreadsheet, FileText } from "lucide-react"

const productsData = [
  { id: "PRD001", name: "PowerShield Ultra 5000VA", serial: "SN-UPS-20240101", stock: 25 },
  { id: "PRD002", name: "StabilVolt Pro 3000", serial: "SN-STB-20240215", stock: 8 },
  { id: "PRD003", name: "UPS Compact 1500VA", serial: "SN-UPS-20230901", stock: 0 },
]

const transactionsData = [
  { id: "TRX001", date: "2024-01-15", type: "in", product: "PowerShield Ultra 5000VA", qty: 10 },
  { id: "TRX002", date: "2024-01-16", type: "out", product: "StabilVolt Pro 3000", qty: 5 },
  { id: "TRX003", date: "2024-01-17", type: "in", product: "UPS Compact 1500VA", qty: 20 },
]

export default function SettingsPage() {
  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return
    const headers = Object.keys(data[0])
    const csvContent = [headers.join(","), ...data.map(row => headers.map(h => `"${row[h]}"`).join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const exportToJSON = (data: Record<string, unknown>[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  // Desktop Content
  const DesktopContent = () => (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="bg-secondary">
        <TabsTrigger value="general">Umum</TabsTrigger>
        <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
        <TabsTrigger value="security">Keamanan</TabsTrigger>
        <TabsTrigger value="data">Data</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Informasi Gudang</CardTitle><CardDescription>Atur informasi dasar gudang</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Nama Gudang</Label><Input defaultValue="ETS Warehouse" className="bg-secondary" /></div>
              <div className="space-y-2"><Label>Kode Gudang</Label><Input defaultValue="ETS-001" className="bg-secondary" /></div>
            </div>
            <div className="space-y-2"><Label>Alamat</Label><Input defaultValue="Jl. Industri No. 123, Jakarta" className="bg-secondary" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Telepon</Label><Input defaultValue="+62 21 1234567" className="bg-secondary" /></div>
              <div className="space-y-2"><Label>Email</Label><Input defaultValue="info@ets.com" className="bg-secondary" /></div>
            </div>
            <div className="space-y-2">
              <Label>Zona Waktu</Label>
              <Select defaultValue="wib"><SelectTrigger className="bg-secondary"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="wib">WIB (GMT+7)</SelectItem><SelectItem value="wita">WITA (GMT+8)</SelectItem><SelectItem value="wit">WIT (GMT+9)</SelectItem></SelectContent></Select>
            </div>
            <Button><Save className="mr-2 h-4 w-4" />Simpan</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Notifikasi</CardTitle><CardDescription>Atur kapan Anda menerima notifikasi</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between"><div><Label>Stok Menipis</Label><p className="text-xs text-muted-foreground">Notifikasi saat stok mendekati minimum</p></div><Switch defaultChecked /></div>
            <Separator />
            <div className="flex items-center justify-between"><div><Label>Stok Habis</Label><p className="text-xs text-muted-foreground">Notifikasi saat stok habis</p></div><Switch defaultChecked /></div>
            <Separator />
            <div className="flex items-center justify-between"><div><Label>Transaksi Baru</Label><p className="text-xs text-muted-foreground">Notifikasi untuk setiap transaksi</p></div><Switch /></div>
            <Separator />
            <div className="flex items-center justify-between"><div><Label>Email Notifikasi</Label><p className="text-xs text-muted-foreground">Kirim notifikasi via email</p></div><Switch defaultChecked /></div>
            <Button><Save className="mr-2 h-4 w-4" />Simpan</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Keamanan</CardTitle><CardDescription>Atur keamanan akun</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Password Lama</Label><Input type="password" className="bg-secondary" /></div>
            <div className="space-y-2"><Label>Password Baru</Label><Input type="password" className="bg-secondary" /></div>
            <div className="space-y-2"><Label>Konfirmasi Password</Label><Input type="password" className="bg-secondary" /></div>
            <Separator />
            <div className="flex items-center justify-between"><div><Label>Two-Factor Authentication</Label><p className="text-xs text-muted-foreground">Keamanan ekstra</p></div><Switch /></div>
            <Button><Save className="mr-2 h-4 w-4" />Simpan</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="data" className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" />Manajemen Data</CardTitle><CardDescription>Ekspor dan kelola data</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3"><div><Label>Ekspor Data Produk</Label><p className="text-xs text-muted-foreground">Download data produk</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => exportToCSV(productsData, "products")}><FileSpreadsheet className="mr-2 h-4 w-4" />CSV</Button><Button variant="outline" size="sm" onClick={() => exportToJSON(productsData, "products")}><FileText className="mr-2 h-4 w-4" />JSON</Button></div></div>
            <Separator />
            <div className="space-y-3"><div><Label>Ekspor Data Transaksi</Label><p className="text-xs text-muted-foreground">Download riwayat transaksi</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => exportToCSV(transactionsData, "transactions")}><FileSpreadsheet className="mr-2 h-4 w-4" />CSV</Button><Button variant="outline" size="sm" onClick={() => exportToJSON(transactionsData, "transactions")}><FileText className="mr-2 h-4 w-4" />JSON</Button></div></div>
            <Separator />
            <div className="space-y-3"><div><Label>Full Backup</Label><p className="text-xs text-muted-foreground">Download semua data</p></div><Button size="sm" onClick={() => { const allData = { products: productsData, transactions: transactionsData }; exportToJSON([allData], "full_backup") }}><Download className="mr-2 h-4 w-4" />Download</Button></div>
            <Separator />
            <div className="flex items-center justify-between"><div><Label>Backup Otomatis</Label><p className="text-xs text-muted-foreground">Backup harian</p></div><Switch defaultChecked /></div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )

  // Mobile Content - Compact
  const MobileContent = () => (
    <Tabs defaultValue="general" className="space-y-2.5">
      <TabsList className="bg-secondary w-full grid grid-cols-4 h-8">
        <TabsTrigger value="general" className="text-[10px] data-[state=active]:text-xs">Umum</TabsTrigger>
        <TabsTrigger value="notifications" className="text-[10px] data-[state=active]:text-xs">Notif</TabsTrigger>
        <TabsTrigger value="security" className="text-[10px] data-[state=active]:text-xs">Keamanan</TabsTrigger>
        <TabsTrigger value="data" className="text-[10px] data-[state=active]:text-xs">Data</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-2.5">
        <Card>
          <CardHeader className="p-2.5 pb-1.5"><CardTitle className="text-xs flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-primary" />Info Gudang</CardTitle></CardHeader>
          <CardContent className="p-2.5 pt-0 space-y-2">
            <div className="space-y-1"><Label className="text-[10px]">Nama</Label><Input defaultValue="ETS Warehouse" className="h-8 bg-secondary text-xs" /></div>
            <div className="space-y-1"><Label className="text-[10px]">Kode</Label><Input defaultValue="ETS-001" className="h-8 bg-secondary text-xs" /></div>
            <div className="space-y-1"><Label className="text-[10px]">Alamat</Label><Input defaultValue="Jl. Industri No. 123" className="h-8 bg-secondary text-xs" /></div>
            <Button size="sm" className="w-full h-8 text-xs"><Save className="mr-1 h-3.5 w-3.5" />Simpan</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-2.5">
        <Card>
          <CardHeader className="p-2.5 pb-1.5"><CardTitle className="text-xs flex items-center gap-1"><Bell className="h-3.5 w-3.5 text-primary" />Notifikasi</CardTitle></CardHeader>
          <CardContent className="p-2.5 pt-0 space-y-2">
            <div className="flex items-center justify-between py-1"><span className="text-[11px]">Stok Menipis</span><Switch defaultChecked /></div>
            <Separator />
            <div className="flex items-center justify-between py-1"><span className="text-[11px]">Stok Habis</span><Switch defaultChecked /></div>
            <Separator />
            <div className="flex items-center justify-between py-1"><span className="text-[11px]">Transaksi Baru</span><Switch /></div>
            <Separator />
            <div className="flex items-center justify-between py-1"><span className="text-[11px]">Email</span><Switch defaultChecked /></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="space-y-2.5">
        <Card>
          <CardHeader className="p-2.5 pb-1.5"><CardTitle className="text-xs flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-primary" />Keamanan</CardTitle></CardHeader>
          <CardContent className="p-2.5 pt-0 space-y-2">
            <div className="space-y-1"><Label className="text-[10px]">Password Lama</Label><Input type="password" className="h-8 bg-secondary text-xs" /></div>
            <div className="space-y-1"><Label className="text-[10px]">Password Baru</Label><Input type="password" className="h-8 bg-secondary text-xs" /></div>
            <div className="space-y-1"><Label className="text-[10px]">Konfirmasi</Label><Input type="password" className="h-8 bg-secondary text-xs" /></div>
            <Separator />
            <div className="flex items-center justify-between py-1"><span className="text-[11px]">2FA</span><Switch /></div>
            <Button size="sm" className="w-full h-8 text-xs"><Save className="mr-1 h-3.5 w-3.5" />Simpan</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="data" className="space-y-2.5">
        <Card>
          <CardHeader className="p-2.5 pb-1.5"><CardTitle className="text-xs flex items-center gap-1"><Database className="h-3.5 w-3.5 text-primary" />Ekspor Data</CardTitle></CardHeader>
          <CardContent className="p-2.5 pt-0 space-y-2">
            <div className="space-y-1"><span className="text-[11px] text-muted-foreground">Produk</span><div className="flex gap-1.5"><Button variant="outline" size="sm" className="h-7 text-[10px] flex-1" onClick={() => exportToCSV(productsData, "products")}>CSV</Button><Button variant="outline" size="sm" className="h-7 text-[10px] flex-1" onClick={() => exportToJSON(productsData, "products")}>JSON</Button></div></div>
            <Separator />
            <div className="space-y-1"><span className="text-[11px] text-muted-foreground">Transaksi</span><div className="flex gap-1.5"><Button variant="outline" size="sm" className="h-7 text-[10px] flex-1" onClick={() => exportToCSV(transactionsData, "transactions")}>CSV</Button><Button variant="outline" size="sm" className="h-7 text-[10px] flex-1" onClick={() => exportToJSON(transactionsData, "transactions")}>JSON</Button></div></div>
            <Separator />
            <Button size="sm" className="w-full h-8 text-xs" onClick={() => { const allData = { products: productsData, transactions: transactionsData }; exportToJSON([allData], "full_backup") }}><Download className="mr-1 h-3.5 w-3.5" />Full Backup</Button>
            <Separator />
            <div className="flex items-center justify-between py-1"><span className="text-[11px]">Auto Backup</span><Switch defaultChecked /></div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )

  return (
    <AppLayout
      title="Pengaturan"
      subtitle="Kelola pengaturan sistem"
      desktopContent={<DesktopContent />}
      mobileContent={<MobileContent />}
    />
  )
}
