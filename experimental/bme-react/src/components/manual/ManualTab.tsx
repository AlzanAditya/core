import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import type { InvoiceItem } from '../../types';
import { formatCurrency, formatNumberStr, cn } from '../../lib/utils';
import {
  buildInvoiceHTML,
  buildSuratJalanHTML,
  INVOICE_STYLE,
  SURAT_JALAN_STYLE,
} from '../../lib/pdfGenerator';
import { PreviewModal } from '../pdf/PreviewModal';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Trash2,
  Copy,
  Plus,
  FileText,
  AlertTriangle,
  Download,
  Save,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  Printer,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export const ManualTab: React.FC = () => {
  const { tabId } = useParams<{ tabId: string }>();
  const navigate = useNavigate();
  const {
    tabs,
    manualViewMode,
    setManualViewMode,
    manualCardMode,
    setManualCardMode,
    updateActiveTabTitle,
    updateActiveTabData,
    addToHistory,
    settings,
    templates,
    addTemplate,
    loading,
  } = useAppState();

  const activeTab = tabs.find(t => t.id === tabId);

  useEffect(() => {
    if (!loading && !activeTab) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, activeTab, navigate]);

  const items: InvoiceItem[] = activeTab?.data?.invoiceItems || [];
  
  // Local state for template picker modal
  const [templateSearch, setTemplateSearch] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeItemIndexForTemplate, setActiveItemIndexForTemplate] = useState<number | null>(null);

  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState('');

  // Flat item list derived from global templates for quick-pick
  const flatItemTemplates = templates.flatMap(tmpl =>
    tmpl.items.map(item => ({
      name: item.name,
      price: item.price,
      tipe: item.tipe || '-',
      note: item.note || '',
      _templateName: tmpl.name,
    }))
  );

  // Document Preview states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState<'invoice' | 'surat'>('invoice');
  
  const manualEdits = activeTab?.data?.manualEdits || { invoice: null, letter: null };

  const handleOpenPreview = (type: 'invoice' | 'surat') => {
    if (items.length === 0) {
      alert('Belum ada item untuk dilihat!');
      return;
    }
    if (settings.titleRequired && !activeTab?.title?.trim()) {
      alert('Harap isi Judul Invoice terlebih dahulu!');
      return;
    }
    setPreviewType(type);
    setIsPreviewOpen(true);
  };

  const handleSaveEdits = (editedHtml: string) => {
    const newEdits = {
      ...manualEdits,
      [previewType === 'surat' ? 'letter' : 'invoice']: editedHtml
    };
    updateActiveTabData({ manualEdits: newEdits });
  };

  const handlePrintCombined = () => {
    if (items.length === 0) {
      alert('Belum ada item untuk dicetak!');
      return;
    }
    if (settings.titleRequired && !activeTab?.title?.trim()) {
      alert('Harap isi Judul Invoice terlebih dahulu!');
      return;
    }

    const invoiceHtml = manualEdits.invoice || buildInvoiceHTML(items, activeTab?.title || '', false);
    const suratJalanHtml = manualEdits.letter || buildSuratJalanHTML(items);

    const extractBody = (fullHtml: string) => {
      const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      return bodyMatch ? bodyMatch[1] : fullHtml;
    };

    const scopedSuratJalanStyle = SURAT_JALAN_STYLE.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (match: string, selector: string, suffix: string) => {
      if (selector.trim().startsWith('@') || selector.trim() === '') return match;
      const scopedSelectors = selector.split(',').map((sel: string) => {
        const s = sel.trim();
        if (!s) return '';
        if (s === 'html' || s === 'body') return `#surat-jalan-wrapper`;
        return `#surat-jalan-wrapper ${s}`;
      }).join(', ');
      return `${scopedSelectors} ${suffix}`;
    });

    const fileTitle = `Dokumen-${activeTab?.title || 'BME'}`;
    const combinedHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>${fileTitle}</title>
    <style>
        ${INVOICE_STYLE}
        ${scopedSuratJalanStyle}
        @media print {
            .page-break { page-break-before: always; }
            body { margin: 0; padding: 0; }
        }
    </style>
</head>
<body>
    <div id="invoice-wrapper">
        ${extractBody(invoiceHtml)}
    </div>
    <div class="page-break"></div>
    <div id="surat-jalan-wrapper">
        ${extractBody(suratJalanHtml)}
    </div>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(combinedHtml);
    w.document.close();
    w.document.title = fileTitle;
    setTimeout(() => {
      w.focus();
      w.print();
    }, 300);
  };

  const handleUpdateItems = (newItems: InvoiceItem[]) => {
    updateActiveTabData({ invoiceItems: newItems });
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      name: '',
      price: 0,
      qty: 1,
      note: '',
      tipe: '',
      qtyUnit: 'pcs',
      invKeterangan: '',
      sjKeterangan: '',
      isNew: true
    };
    handleUpdateItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    handleUpdateItems(updated);
  };

  const handleDuplicateItem = (index: number) => {
    const itemToClone = items[index];
    const cloned = { ...itemToClone, isNew: true };
    const updated = [...items];
    updated.splice(index + 1, 0, cloned);
    handleUpdateItems(updated);
  };

  const handleFieldChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    handleUpdateItems(updated);
  };

  // Grand Total Calculation
  const grandTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);

  // Validation Check
  const getValidationCount = () => {
    let emptyCount = 0;
    if (!activeTab?.title?.trim()) emptyCount++;

    items.forEach(item => {
      if (manualCardMode === 'advance') {
        if (!item.invKeterangan?.trim()) emptyCount++;
        if (!item.name?.trim()) emptyCount++;
        if (!item.price || item.price <= 0) emptyCount++;
        if (!item.sjKeterangan?.trim()) emptyCount++;
      } else {
        if (!item.name?.trim()) emptyCount++;
        if (!item.price || item.price <= 0) emptyCount++;
        if (!item.tipe?.trim() || item.tipe === '-') emptyCount++;
        if (!item.note?.trim()) emptyCount++;
      }
    });

    return emptyCount;
  };

  const emptyCount = getValidationCount();

  const handleSaveToHistory = async () => {
    if (items.length === 0) {
      alert('Belum ada item untuk disimpan!');
      return;
    }
    if (settings.titleRequired && !activeTab?.title?.trim()) {
      alert('Harap isi Judul Invoice terlebih dahulu!');
      return;
    }

    try {
      await addToHistory({
        title: activeTab?.title || 'Invoice Tanpa Judul',
        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        items: items,
        cardMode: manualCardMode
      });
      alert('Invoice berhasil disimpan ke riwayat!');
    } catch (e: any) {
      alert('Gagal menyimpan invoice: ' + e.message);
    }
  };

  const handleOpenTemplatePicker = (index: number) => {
    setActiveItemIndexForTemplate(index);
    setIsTemplateModalOpen(true);
  };

  const handleSelectTemplate = (template: { name: string; price: number; tipe?: string; note?: string }) => {
    if (activeItemIndexForTemplate === null) return;
    
    const updated = items.map((item, i) => {
      if (i === activeItemIndexForTemplate) {
        return {
          ...item,
          name: template.name,
          price: template.price,
          tipe: template.tipe || '-',
          note: template.note || '',
        };
      }
      return item;
    });

    handleUpdateItems(updated);
    setIsTemplateModalOpen(false);
    setActiveItemIndexForTemplate(null);
  };

  const filteredTemplates = flatItemTemplates.filter(t =>
    t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    t._templateName.toLowerCase().includes(templateSearch.toLowerCase())
  );

  if (!activeTab) return <div className="p-6">Memuat tab...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-20 relative">
      {/* Mobile Title input */}
      <div className="flex flex-col gap-1.5 lg:hidden bg-card border p-4 rounded-xl shadow-sm">
        <Label htmlFor="mobile-title" className="text-xs font-bold text-muted-foreground uppercase">Judul Invoice</Label>
        <Input
          id="mobile-title"
          type="text"
          value={activeTab.title}
          onChange={(e) => updateActiveTabTitle(e.target.value)}
          placeholder="Contoh: Invoice #001"
          className={cn(
            "text-sm font-semibold h-9 focus:ring-primary",
            !activeTab.title.trim() && "border-amber-500 bg-amber-500/5 focus:border-amber-500"
          )}
        />
      </div>

      {/* View & Card Mode selectors (Mobile Only / Layout alignment) */}
      <div className="flex justify-between items-center lg:hidden gap-2 bg-card border p-3 rounded-xl shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Tampilan</span>
          <Button
            variant={manualViewMode === 'card' ? 'default' : 'outline'}
            size="icon"
            className="size-7"
            onClick={() => setManualViewMode('card')}
          >
            <LayoutGrid className="size-3.5" />
          </Button>
          <Button
            variant={manualViewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            className="size-7"
            onClick={() => setManualViewMode('table')}
          >
            <List className="size-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Mode</span>
          <Button
            variant={manualCardMode === 'simple' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-[10px] px-2.5 rounded"
            onClick={() => setManualCardMode('simple')}
          >
            Sederhana
          </Button>
          <Button
            variant={manualCardMode === 'advance' ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-[10px] px-2.5 rounded"
            onClick={() => setManualCardMode('advance')}
          >
            Advance
          </Button>
        </div>
      </div>

      {/* ITEMS CONTAINER */}
      <div className="flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-dashed rounded-xl min-h-60">
            <FileText className="size-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-semibold">Belum ada item invoice</h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              Tambahkan item secara manual atau pilih dari template barang yang sudah terdaftar.
            </p>
            <Button size="sm" className="mt-4 gap-1.5" onClick={handleAddItem}>
              <Plus className="size-4" />
              <span>Tambah Item</span>
            </Button>
          </div>
        ) : manualViewMode === 'table' ? (
          // TABLE VIEW
          <div className="overflow-x-auto border border-border bg-card rounded-xl shadow-sm">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 font-bold text-muted-foreground">
                  <th className="p-3 text-center w-10">No.</th>
                  <th className="p-3 text-left min-w-40">Barang</th>
                  <th className="p-3 text-right w-28">Harga</th>
                  <th className="p-3 text-center w-24">Tipe</th>
                  <th className="p-3 text-center w-20">Qty</th>
                  <th className="p-3 text-center w-16">Unit</th>
                  <th className="p-3 text-left min-w-48">Note</th>
                  <th className="p-3 text-right w-28">Total</th>
                  <th className="p-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-muted/20 group">
                    <td className="p-2.5 text-center font-bold text-muted-foreground">{index + 1}</td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                          placeholder="Nama Barang"
                          className={cn("h-7 text-xs", !item.name.trim() && "border-amber-500 bg-amber-500/5 focus:border-amber-500")}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7 shrink-0"
                          onClick={() => handleOpenTemplatePicker(index)}
                        >
                          <List className="size-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-2.5">
                      <Input
                        type="text"
                        value={item.price > 0 ? formatNumberStr(String(item.price)) : ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                          handleFieldChange(index, 'price', val);
                        }}
                        placeholder="0"
                        className={cn("h-7 text-xs text-right", (!item.price || item.price <= 0) && "border-amber-500 bg-amber-500/5 focus:border-amber-500")}
                      />
                    </td>
                    <td className="p-2.5">
                      <select
                        value={item.tipe || ''}
                        onChange={(e) => handleFieldChange(index, 'tipe', e.target.value)}
                        className={cn(
                          "flex h-7 w-full rounded-md border border-input bg-transparent px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                          (!item.tipe || item.tipe === '-') && "border-amber-500 bg-amber-500/5 focus:border-amber-500"
                        )}
                      >
                        <option value="-">-</option>
                        <option value="ICA">ICA</option>
                        <option value="Protecta">Protecta</option>
                        <option value="Prolink">Prolink</option>
                        <option value="APC">APC</option>
                      </select>
                    </td>
                    <td className="p-2.5">
                      <Input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleFieldChange(index, 'qty', parseInt(e.target.value) || 1)}
                        className="h-7 text-xs text-center"
                      />
                    </td>
                    <td className="p-2.5">
                      <select
                        value={item.qtyUnit || 'pcs'}
                        onChange={(e) => handleFieldChange(index, 'qtyUnit', e.target.value)}
                        className="flex h-7 w-full rounded-md border border-input bg-transparent px-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="pcs">Pcs</option>
                        <option value="lot">Lot</option>
                      </select>
                    </td>
                    <td className="p-2.5">
                      <Textarea
                        rows={1}
                        value={item.note}
                        onChange={(e) => handleFieldChange(index, 'note', e.target.value)}
                        placeholder="Deskripsi..."
                        className={cn("h-7 text-xs resize-none min-h-7 py-1 px-2.5", !item.note.trim() && "border-amber-500 bg-amber-500/5 focus:border-amber-500")}
                      />
                    </td>
                    <td className="p-2.5 text-right font-semibold text-primary">
                      {formatCurrency(item.price * item.qty)}
                    </td>
                    <td className="p-2.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
                            <ChevronDown className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={() => handleDuplicateItem(index)} className="gap-1.5 text-xs">
                            <Copy className="size-3.5" />
                            <span>Duplikat</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemoveItem(index)} className="gap-1.5 text-xs text-destructive hover:text-destructive">
                            <Trash2 className="size-3.5" />
                            <span>Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // CARD VIEW
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, index) => {
              const showEmptyName = !item.name.trim();
              const showEmptyPrice = !item.price || item.price <= 0;

              if (manualCardMode === 'advance') {
                return (
                  <Card key={index} className={cn("overflow-hidden transition-all hover:scale-[1.005] hover:shadow-md relative", item.isNew && "animate-in fade-in slide-in-from-bottom-2")}>
                    <CardContent className="p-4 flex flex-col gap-3.5">
                      {/* Top actions */}
                      <div className="flex justify-between items-center">
                        <span className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-black text-muted-foreground">
                          {index + 1}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => handleDuplicateItem(index)}>
                            <Copy className="size-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => handleRemoveItem(index)}>
                            <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Invoice Keterangan */}
                      <div className="flex flex-col gap-1">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Invoice - Keterangan</Label>
                        <Textarea
                          value={item.invKeterangan || ''}
                          onChange={(e) => handleFieldChange(index, 'invKeterangan', e.target.value)}
                          placeholder="Keterangan untuk Invoice"
                          className={cn("text-xs min-h-12 py-1.5 resize-none", !item.invKeterangan?.trim() && "border-amber-500 bg-amber-500/5 focus:border-amber-500")}
                          rows={1}
                        />
                      </div>

                      {/* SurJal Nama & Qty */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 flex flex-col gap-1">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase">SurJal - Nama Barang</Label>
                          <div className="flex gap-1">
                            <Input
                              value={item.name}
                              onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                              placeholder="Nama Barang"
                              className={cn("h-8 text-xs", showEmptyName && "border-amber-500 bg-amber-500/5 focus:border-amber-500")}
                            />
                            <Button variant="outline" size="icon" className="size-8 shrink-0" onClick={() => handleOpenTemplatePicker(index)}>
                              <List className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 items-end">
                          <div className="flex rounded border bg-muted/40 p-0.5 text-[10px] font-bold">
                            <button
                              onClick={() => handleFieldChange(index, 'qtyUnit', 'pcs')}
                              className={cn("px-1.5 py-0.5 rounded-sm transition-colors", (item.qtyUnit || 'pcs') === 'pcs' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
                            >
                              Pcs
                            </button>
                            <button
                              onClick={() => handleFieldChange(index, 'qtyUnit', 'lot')}
                              className={cn("px-1.5 py-0.5 rounded-sm transition-colors", item.qtyUnit === 'lot' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
                            >
                              Lot
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 mt-1 border rounded h-8 px-1">
                            <button
                              className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground font-black text-xs"
                              onClick={() => handleFieldChange(index, 'qty', Math.max(1, (item.qty || 1) - 1))}
                            >
                              -
                            </button>
                            <span className="text-xs font-bold w-6 text-center">{item.qty || 1}</span>
                            <button
                              className="size-6 flex items-center justify-center text-muted-foreground hover:text-foreground font-black text-xs"
                              onClick={() => handleFieldChange(index, 'qty', (item.qty || 1) + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* SurJal Keterangan */}
                      <div className="flex flex-col gap-1">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">SurJal - Keterangan</Label>
                        <Textarea
                          value={item.sjKeterangan || ''}
                          onChange={(e) => handleFieldChange(index, 'sjKeterangan', e.target.value)}
                          placeholder="Keterangan untuk Surat Jalan"
                          className={cn("text-xs min-h-12 py-1.5 resize-none", !item.sjKeterangan?.trim() && "border-amber-500 bg-amber-500/5 focus:border-amber-500")}
                          rows={1}
                        />
                      </div>

                      {/* Harga & Subtotal */}
                      <div className="flex justify-between items-end gap-3 pt-1">
                        <div className="flex flex-col gap-1 flex-1 max-w-44">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase">Harga Satuan</Label>
                          <Input
                            type="text"
                            value={item.price > 0 ? formatNumberStr(String(item.price)) : ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                              handleFieldChange(index, 'price', val);
                            }}
                            placeholder="Rp 0"
                            className={cn("h-8 text-xs", showEmptyPrice && "border-amber-500 bg-amber-500/5 focus:border-amber-500")}
                          />
                        </div>

                        <div className="text-right flex flex-col items-end gap-0.5">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">Subtotal</span>
                          <span className="text-sm font-black text-primary">{formatCurrency(item.price * item.qty)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              // SIMPLE MODE (Card)
              const showEmptyTipe = !item.tipe || item.tipe === '-';
              const showEmptyNote = !item.note.trim();

              return (
                <Card key={index} className={cn("overflow-hidden transition-all hover:scale-[1.005] hover:shadow-md relative", item.isNew && "animate-in fade-in slide-in-from-bottom-2")}>
                  <CardContent className="p-4 flex flex-col gap-3.5">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <span className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-black text-muted-foreground">
                        {index + 1}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => handleDuplicateItem(index)}>
                          <Copy className="size-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => handleRemoveItem(index)}>
                          <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex flex-col gap-1">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Nama Barang</Label>
                      <div className="flex gap-1">
                        <Input
                          value={item.name}
                          onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                          placeholder="Contoh: Kabel NYM 3x2.5"
                          className={cn("h-8 text-xs", showEmptyName && "border-amber-500 bg-amber-500/5 focus:border-amber-500")}
                        />
                        <Button variant="outline" size="icon" className="size-8 shrink-0" onClick={() => handleOpenTemplatePicker(index)}>
                          <List className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Row 2: Price, Tipe, Qty */}
                    <div className="grid grid-cols-12 gap-3.5">
                      <div className="col-span-5 flex flex-col gap-1">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Harga</Label>
                        <Input
                          type="text"
                          value={item.price > 0 ? formatNumberStr(String(item.price)) : ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                            handleFieldChange(index, 'price', val);
                          }}
                          placeholder="Rp 0"
                          className={cn("h-8 text-xs", showEmptyPrice && "border-amber-500 bg-amber-500/5 focus:border-amber-500")}
                        />
                      </div>

                      <div className="col-span-4 flex flex-col gap-1">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">Tipe</Label>
                        <select
                          value={item.tipe || ''}
                          onChange={(e) => handleFieldChange(index, 'tipe', e.target.value)}
                          className={cn(
                            "flex h-8 w-full rounded-md border border-input bg-transparent px-2.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            showEmptyTipe && "border-amber-500 bg-amber-500/5 focus:border-amber-500"
                          )}
                        >
                          <option value="-">-</option>
                          <option value="ICA">ICA</option>
                          <option value="Protecta">Protecta</option>
                          <option value="Prolink">Prolink</option>
                          <option value="APC">APC</option>
                        </select>
                      </div>

                      <div className="col-span-3 flex flex-col gap-1 items-end">
                        <div className="flex rounded border bg-muted/40 p-0.5 text-[9px] font-bold">
                          <button
                            onClick={() => handleFieldChange(index, 'qtyUnit', 'pcs')}
                            className={cn("px-1 py-0.5 rounded-sm transition-colors", (item.qtyUnit || 'pcs') === 'pcs' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
                          >
                            Pcs
                          </button>
                          <button
                            onClick={() => handleFieldChange(index, 'qtyUnit', 'lot')}
                            className={cn("px-1 py-0.5 rounded-sm transition-colors", item.qtyUnit === 'lot' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
                          >
                            Lot
                          </button>
                        </div>

                        <div className="flex items-center gap-1 border rounded h-8 px-1 mt-1 shrink-0">
                          <button
                            className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground font-black text-xs"
                            onClick={() => handleFieldChange(index, 'qty', Math.max(1, (item.qty || 1) - 1))}
                          >
                            -
                          </button>
                          <span className="text-xs font-bold w-5 text-center">{item.qty || 1}</span>
                          <button
                            className="size-5 flex items-center justify-center text-muted-foreground hover:text-foreground font-black text-xs"
                            onClick={() => handleFieldChange(index, 'qty', (item.qty || 1) + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Note */}
                    <div className="flex flex-col gap-1">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Deskripsi Item</Label>
                      <Textarea
                        value={item.note}
                        onChange={(e) => handleFieldChange(index, 'note', e.target.value)}
                        placeholder="Keterangan rinci barang/jasa..."
                        className={cn("text-xs min-h-12 py-1.5 resize-none", showEmptyNote && "border-amber-500 bg-amber-500/5 focus:border-amber-500")}
                        rows={1}
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="flex justify-between items-center pt-1 border-t border-dashed">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Subtotal</span>
                      <span className="text-xs font-black text-primary">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Button
          variant="outline"
          className="border-dashed h-10 w-full mt-2"
          onClick={handleAddItem}
        >
          <Plus className="size-4 mr-2" />
          <span>Tambah Item Baru</span>
        </Button>
      </div>

      {/* FLOAT ACTION BAR (STICKY BOTTOM) */}
      <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border p-3 flex justify-between items-center shadow-lg z-20 md:px-6">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[9px] font-bold text-muted-foreground uppercase">Total Pembayaran</span>
          <span className="text-base font-black text-primary tracking-tight">{formatCurrency(grandTotal)}</span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-full font-semibold" onClick={handleSaveToHistory}>
            <Save className="size-3.5" />
            <span>Simpan</span>
          </Button>

          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-full font-semibold" onClick={() => {
            if (items.length === 0) {
              alert('Belum ada item untuk disimpan!');
              return;
            }
            setIsSaveTemplateOpen(true);
          }}>
            <Plus className="size-3.5" />
            <span>Simpan Template</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-9 gap-1.5 text-xs rounded-full font-semibold bg-primary shadow-[0_4px_12px_rgba(var(--primary),0.3)]">
                <Download className="size-3.5" />
                <span>Unduh</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem onClick={() => handleOpenPreview('invoice')} className="gap-1.5 text-xs">
                <FileText className="size-3.5" />
                <span>Pratinjau Invoice</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenPreview('surat')} className="gap-1.5 text-xs">
                <FileText className="size-3.5" />
                <span>Pratinjau Surat Jalan</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintCombined} className="gap-1.5 text-xs">
                <Printer className="size-3.5" />
                <span>Cetak Gabungan (PDF)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* REQUIRED FIELDS BADGE INDICATOR */}
      {emptyCount > 0 && (
        <div
          onClick={() => {
            const firstEmpty = document.querySelector('.border-amber-500, .bg-amber-500\\/5');
            if (firstEmpty) {
              firstEmpty.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (firstEmpty instanceof HTMLElement) {
                firstEmpty.focus();
              }
            }
          }}
          className="fixed bottom-16 right-4 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-full shadow-md z-30 cursor-pointer transition-all animate-bounce"
        >
          <AlertTriangle className="size-3.5 shrink-0" />
          <span>{emptyCount} Input Kosong</span>
        </div>
      )}

      {/* TEMPLATE PICKER MODAL (DIALOG) */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-md w-[90%] rounded-xl text-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Pilih dari Template Barang</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center gap-2 border bg-muted/40 rounded px-2.5 h-8">
              <Search className="size-3.5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Cari nama barang..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="bg-transparent border-none text-xs focus:outline-none focus:ring-0 flex-1 w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
              {filteredTemplates.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Tidak ada barang cocok.</p>
              ) : (
                filteredTemplates.map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectTemplate(t)}
                    className="flex justify-between items-center p-2.5 rounded border border-border bg-card hover:bg-accent/40 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold truncate">{t.name}</span>
                      {t.note && <span className="text-[10px] text-muted-foreground truncate">{t.note}</span>}
                    </div>
                    <span className="font-bold text-primary shrink-0 ml-4">{formatCurrency(t.price)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DOCUMENT PREVIEW MODAL */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        type={previewType}
        title={activeTab.title || 'Dokumen BME'}
        html={
          previewType === 'invoice'
            ? manualEdits.invoice || buildInvoiceHTML(items, activeTab.title || '', false)
            : manualEdits.letter || buildSuratJalanHTML(items)
        }
        onSaveEdits={handleSaveEdits}
      />

      {/* SAVE TEMPLATE DIALOG */}
      <Dialog open={isSaveTemplateOpen} onOpenChange={setIsSaveTemplateOpen}>
        <DialogContent className="max-w-md w-[90%] rounded-xl text-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Simpan Sebagai Template</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="template-name" className="font-semibold text-muted-foreground uppercase text-[9px]">Nama Template</Label>
              <Input
                id="template-name"
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
                placeholder="Misal: Paket Rumah Tipe 36"
                className="h-8 text-xs"
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Menyimpan {items.length} item aktif ke template barang reusable.
              </p>
            </div>

            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" className="h-8 flex-1" onClick={() => { setIsSaveTemplateOpen(false); setTemplateNameInput(''); }}>
                Batal
              </Button>
              <Button size="sm" className="h-8 flex-1 font-bold" onClick={async () => {
                const name = templateNameInput.trim();
                if (!name) {
                  alert('Nama template wajib diisi!');
                  return;
                }
                try {
                  await addTemplate(name, items);
                  alert(`Template "${name}" berhasil disimpan!`);
                  setIsSaveTemplateOpen(false);
                  setTemplateNameInput('');
                } catch (e: any) {
                  alert('Gagal menyimpan template: ' + e.message);
                }
              }}>
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
