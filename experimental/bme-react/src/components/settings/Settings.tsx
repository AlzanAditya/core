import React, { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { formatCurrency } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import {
  Settings as SettingsIcon,
  Upload,
  RefreshCw,
  Trash2,
  HelpCircle,
  FileCode,
  Table,
  Archive,
  Cloud,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import JSZip from 'jszip';

export const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetSettings,
    history,
    isLoggedIn,
    adminProfile,
    handleLogout,
    templates,
    removeTemplate,
    reorderTemplates,
  } = useAppState();

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  const handleDownloadFormatChange = (format: 'pdf' | 'png' | 'jpeg') => {
    updateSettings({ defaultDownloadMethod: format });
  };

  const handleTargetChange = (val: number[]) => {
    updateSettings({ monthlyTarget: val[0] });
  };

  const handleFileNameChange = (field: 'invoice' | 'suratJalan', value: string) => {
    const formats = settings.fileNameFormat || { invoice: '', suratJalan: '' };
    updateSettings({
      fileNameFormat: {
        ...formats,
        [field]: value,
      },
    });
  };

  // Backups / Data portability options
  const getBackupDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  const handleExportJSON = () => {
    if (history.length === 0) {
      alert('Riwayat kosong!');
      return;
    }
    const jsonStr = JSON.stringify(history, null, 2);
    downloadBlob(new Blob([jsonStr], { type: 'application/json' }), `BME-Backup-${getBackupDateStr()}.json`);
  };

  const handleExportCSV = () => {
    if (history.length === 0) {
      alert('Riwayat kosong!');
      return;
    }

    let csvContent = "Judul,Tanggal,Barang,Harga,Qty,Total\n";
    history.forEach(h => {
      const title = `"${(h.title || 'Untitled').replace(/"/g, '""')}"`;
      h.items.forEach(item => {
        const name = `"${(item.name || '').replace(/"/g, '""')}"`;
        csvContent += `${title},${h.date},${name},${item.price},${item.qty},${item.price * item.qty}\n`;
      });
    });
    downloadBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), `BME-Data-${getBackupDateStr()}.csv`);
  };

  const handleExportZIP = async () => {
    if (history.length === 0) {
      alert('Riwayat kosong!');
      return;
    }

    try {
      const zip = new JSZip();

      // JSON backup
      zip.file("backup.json", JSON.stringify(history, null, 2));

      // CSV backup
      let csvContent = "Judul,Tanggal,Barang,Harga,Qty,Total\n";
      history.forEach(h => {
        const title = `"${(h.title || 'Untitled').replace(/"/g, '""')}"`;
        h.items.forEach(item => {
          const name = `"${(item.name || '').replace(/"/g, '""')}"`;
          csvContent += `${title},${h.date},${name},${item.price},${item.qty},${item.price * item.qty}\n`;
        });
      });
      zip.file("data.csv", csvContent);

      const content = await zip.generateAsync({ type: "blob" });
      downloadBlob(content, `BME-Archive-${getBackupDateStr()}.zip`);
    } catch (e: any) {
      alert('Gagal mengekspor ZIP: ' + e.message);
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (Array.isArray(data)) {
          // Merge imported data with local history
          // In real implementation, this would save to IndexedDB and update context.
          // To keep it simple, we check structure
          console.log(`Membaca ${data.length} data. Proses merge...`);
          // Save to localstorage as fallback
          const merged = [...data, ...history];
          // Filter unique IDs
          const unique = Array.from(new Map(merged.map(item => [item.id || item.timestamp, item])).values());
          localStorage.setItem('bme_history', JSON.stringify(unique));
          alert(`Sukses mengimpor ${unique.length - history.length} transaksi baru!`);
          window.location.reload(); // Reload to refresh state
        } else {
          alert('Format backup tidak valid!');
        }
      } catch (err) {
        alert('Gagal memproses file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSettings = () => {
    if (window.confirm('Reset semua pengaturan ke default?')) {
      resetSettings();
    }
  };

  const handleWipeAll = () => {
    if (window.confirm('PERINGATAN! Semua riwayat, template, dan data lokal akan dihapus permanen. Lanjutkan?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-2 border-b pb-3">
        <SettingsIcon className="size-5 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">Pengaturan Sistem</h1>
      </div>

      {/* Cloud Account Status */}
      <Card className="shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Cloud className="size-4 text-primary" />
            <span>Akun SaaS &amp; Sinkronisasi</span>
          </CardTitle>
          <CardDescription className="text-[10px]">
            Kelola koneksi cloud database Anda untuk backup otomatis multi-perangkat.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 text-xs">
          {isLoggedIn && adminProfile ? (
            <div className="flex items-center justify-between border bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-emerald-500/30 shrink-0">
                  <AvatarImage src={adminProfile.avatar_url || ''} />
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    {adminProfile.full_name?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-foreground">{adminProfile.full_name || 'Administrator'}</h4>
                  <p className="text-[10px] text-muted-foreground">{adminProfile.email}</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive" onClick={handleLogout}>
                <LogOut className="size-3.5" />
                <span>Keluar</span>
              </Button>
            </div>
          ) : (
            <div className="border border-dashed p-4 rounded-xl text-center flex flex-col items-center">
              <Cloud className="size-8 text-muted-foreground/40 mb-2" />
              <p className="font-medium text-muted-foreground">Akun Belum Terhubung</p>
              <p className="text-[10px] text-muted-foreground max-w-xs mt-0.5 mb-3">
                Hubungkan ke Berkah Maju Elektrik SaaS untuk mengaktifkan sinkronisasi asinkron offline-resilient.
              </p>
              <Button size="sm" onClick={() => alert('Log masuk dari Dashboard menggunakan tombol Google OAuth.')}>
                Masuk / Daftar Akun
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme preferences */}
      <Card className="shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold">Tema Aplikasi</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="flex gap-2">
            {[
              { id: 'light', name: 'Terang', icon: <Sun className="size-3.5" /> },
              { id: 'dark', name: 'Gelap', icon: <Moon className="size-3.5" /> },
              { id: 'system', name: 'Sistem', icon: <Monitor className="size-3.5" /> }
            ].map(t => (
              <Button
                key={t.id}
                variant={settings.theme === t.id ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs gap-1.5 px-3 rounded-full"
                onClick={() => handleThemeChange(t.id as any)}
              >
                {t.icon}
                <span>{t.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target and PDF Format */}
      <Card className="shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold">Format Dokumen &amp; Target Keuangan</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 flex flex-col gap-5 text-xs">
          {/* Target Omset */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between font-semibold">
              <Label className="text-xs">Target Omset Bulanan</Label>
              <span className="text-primary">{formatCurrency(settings.monthlyTarget || 3800000)}</span>
            </div>
            <Slider
              defaultValue={[settings.monthlyTarget || 3800000]}
              max={10000000}
              step={100000}
              onValueChange={handleTargetChange}
              className="py-1"
            />
          </div>

          {/* Download Method */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold">Metode Unduhan Utama</Label>
            <div className="flex gap-2">
              {['pdf', 'png', 'jpeg'].map(f => (
                <Button
                  key={f}
                  variant={settings.defaultDownloadMethod === f ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs rounded-full uppercase"
                  onClick={() => handleDownloadFormatChange(f as any)}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Form Validations */}
          <div className="flex justify-between items-center border-t pt-4">
            <div className="flex flex-col gap-0.5">
              <Label className="text-xs font-semibold">Validasi Judul Invoice</Label>
              <span className="text-[10px] text-muted-foreground">Mencegah ekspor dokumen jika judul masih kosong.</span>
            </div>
            <Switch
              checked={settings.titleRequired !== false}
              onCheckedChange={(checked) => updateSettings({ titleRequired: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* File naming formats */}
      <Card className="shadow-sm">
        <CardHeader className="p-5 pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-bold">Format Penamaan Berkas</CardTitle>
            <Button variant="ghost" size="icon" className="size-6 text-muted-foreground" onClick={() => setIsHelpOpen(true)}>
              <HelpCircle className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0 flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="format-invoice" className="font-semibold text-muted-foreground uppercase text-[9px]">Format Invoice</Label>
              <Input
                id="format-invoice"
                value={settings.fileNameFormat?.invoice || 'Invoice-{judul}'}
                onChange={(e) => handleFileNameChange('invoice', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="format-surat-jalan" className="font-semibold text-muted-foreground uppercase text-[9px]">Format Surat Jalan</Label>
              <Input
                id="format-surat-jalan"
                value={settings.fileNameFormat?.suratJalan || 'Surat Jalan-{judul}'}
                onChange={(e) => handleFileNameChange('suratJalan', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Config */}
      <Card className="shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold">Konfigurasi Ekstraktor AI</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 flex flex-col gap-3.5 text-xs">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="setting-ai-prompt" className="font-semibold text-muted-foreground uppercase text-[9px]">System Prompt Default</Label>
            <Textarea
              id="setting-ai-prompt"
              value={settings.aiDefaultPrompt || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateSettings({ aiDefaultPrompt: e.target.value })}
              className="text-xs min-h-24 leading-normal resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* Kelola Template Invoice */}
      <Card className="shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold">Kelola Template Invoice</CardTitle>
          <CardDescription className="text-[10px]">
            Lihat, hapus, dan atur ulang urutan template barang/paket reusable.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 flex flex-col gap-3 text-xs">
          {templates.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Belum ada template yang disimpan.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {templates.map((t, index) => {
                const totalAmount = t.items.reduce((s, x) => s + (x.price * x.qty), 0);
                return (
                  <div
                    key={t.id}
                    className="flex justify-between items-center p-3 rounded-lg border border-border bg-card hover:bg-accent/15 transition-colors gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs truncate">{t.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{t.items.length} item terdaftar</p>
                    </div>

                    <span className="font-bold text-primary text-xs shrink-0">{formatCurrency(totalAmount)}</span>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === 0}
                        onClick={() => {
                          const newTemplates = [...templates];
                          const temp = newTemplates[index];
                          newTemplates[index] = newTemplates[index - 1];
                          newTemplates[index - 1] = temp;
                          reorderTemplates(newTemplates);
                        }}
                      >
                        <ChevronUp className="size-4 text-muted-foreground" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={index === templates.length - 1}
                        onClick={() => {
                          const newTemplates = [...templates];
                          const temp = newTemplates[index];
                          newTemplates[index] = newTemplates[index + 1];
                          newTemplates[index + 1] = temp;
                          reorderTemplates(newTemplates);
                        }}
                      >
                        <ChevronDown className="size-4 text-muted-foreground" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (window.confirm(`Hapus template "${t.name}"?`)) {
                            removeTemplate(t.id);
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data portability and Backups */}
      <Card className="shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold">Portabilitas Data &amp; Reset</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportJSON}>
              <FileCode className="size-3.5" />
              <span>JSON Backup</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportCSV}>
              <Table className="size-3.5" />
              <span>CSV Table</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportZIP}>
              <Archive className="size-3.5" />
              <span>ZIP Archive</span>
            </Button>
            
            {/* Import JSON button wrapper */}
            <div className="relative">
              <input
                type="file"
                accept="application/json"
                onChange={handleImportJSON}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 w-full">
                <Upload className="size-3.5" />
                <span>Import JSON</span>
              </Button>
            </div>
          </div>

          <div className="flex gap-2 border-t pt-4 mt-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleResetSettings}>
              <RefreshCw className="size-3.5" />
              <span>Reset Settings</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-destructive hover:bg-destructive/10 border-destructive" onClick={handleWipeAll}>
              <Trash2 className="size-3.5" />
              <span>Hapus Semua Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FILE NAMING FORMAT HELP DIALOG */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-md w-[90%] rounded-xl text-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Format Token Penamaan Berkas</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 mt-2">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="border-b text-left text-muted-foreground font-bold">
                  <th className="py-1 px-2">Token</th>
                  <th className="py-1 px-2">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="py-1.5 px-2 font-mono"><code>{`{judul}`}</code></td><td className="py-1.5 px-2">Judul invoice / surat jalan</td></tr>
                <tr><td className="py-1.5 px-2 font-mono"><code>%YYYY</code></td><td className="py-1.5 px-2">Tahun saat ini (misal: 2026)</td></tr>
                <tr><td className="py-1.5 px-2 font-mono"><code>%MM</code></td><td className="py-1.5 px-2">Bulan saat ini (01-12)</td></tr>
                <tr><td className="py-1.5 px-2 font-mono"><code>%DD</code></td><td className="py-1.5 px-2">Tanggal saat ini (01-31)</td></tr>
                <tr><td className="py-1.5 px-2 font-mono"><code>%HH</code></td><td className="py-1.5 px-2">Jam saat ini (00-23)</td></tr>
                <tr><td className="py-1.5 px-2 font-mono"><code>%mm</code></td><td className="py-1.5 px-2">Menit saat ini (00-59)</td></tr>
                <tr><td className="py-1.5 px-2 font-mono"><code>%ss</code></td><td className="py-1.5 px-2">Detik saat ini (00-59)</td></tr>
              </tbody>
            </table>

            <div className="bg-muted p-3 rounded-lg border text-[11px]">
              <strong>Contoh:</strong> <code>Invoice-{`{judul}`} %YYYY-%MM-%DD</code><br />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Akan menghasilkan nama: <em>Invoice-Proyek A 2026-06-03.pdf</em>
              </span>
            </div>

            <Button size="sm" onClick={() => setIsHelpOpen(false)} className="mt-2 w-full">Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
