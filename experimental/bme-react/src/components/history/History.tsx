import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import type { HistoryEntry } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  Edit2,
  Calendar,
  ExternalLink,
  CheckSquare,
  Square,
  AlertTriangle,
  Check,
} from 'lucide-react';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const {
    history,
    updateHistoryTitle,
    removeFromHistory,
    removeMultipleFromHistory,
    createNewTab,
    triggerCloudSync,
  } = useAppState();

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  // Conflict state (mocked or bound to sync engine)
  const [showConflictBanner, setShowConflictBanner] = useState(false);

  // Filter history
  const filteredHistory = history.filter(h => {
    const titleMatch = (h.title || 'Untitled').toLowerCase().includes(search.toLowerCase());
    
    if (!titleMatch) return false;

    if (startDate) {
      const hDate = new Date(h.created_at || h.date);
      const sDate = new Date(startDate);
      if (hDate < sDate) return false;
    }

    if (endDate) {
      const hDate = new Date(h.created_at || h.date);
      const eDate = new Date(endDate);
      // Include the entire day of the end date
      eDate.setHours(23, 59, 59, 999);
      if (hDate > eDate) return false;
    }

    return true;
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredHistory.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredHistory.map(h => h.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Hapus ${selectedIds.size} transaksi terpilih?`)) {
      await removeMultipleFromHistory(Array.from(selectedIds));
      setSelectedIds(new Set());
      alert('Transaksi berhasil dihapus.');
    }
  };

  const handleApplyToManual = (entry: HistoryEntry) => {
    // Create new manual tab with this history's items
    const newTab = createNewTab('manual', entry.title, { invoiceItems: entry.items });
    navigate(`/manual/${newTab.id}`);
  };

  const handleStartEditingTitle = (entry: HistoryEntry) => {
    setEditingId(entry.id);
    setEditTitleInput(entry.title);
  };

  const handleSaveTitleEdit = async (id: string) => {
    if (!editTitleInput.trim()) return;
    await updateHistoryTitle(id, editTitleInput.trim());
    setEditingId(null);
  };

  // Calculate sum of item totals in history entry
  const getEntryTotal = (entry: HistoryEntry) => {
    return entry.items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <HistoryIcon className="size-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Riwayat Dokumen</h1>
        </div>
        
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground bg-muted border px-2 py-1 rounded">
              {selectedIds.size} Terpilih
            </span>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive" onClick={handleBulkDelete}>
              <Trash2 className="size-3.5" />
              <span>Hapus Bulk</span>
            </Button>
          </div>
        )}
      </div>

      {/* Sync Conflict resolutions banner */}
      {showConflictBanner && (
        <div className="flex flex-col gap-3 p-4 bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-xl text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground">Konflik Sinkronisasi Terdeteksi</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Terdapat perbedaan versi antara data di cloud database dan browser local. Pilih aksi resolusi di bawah ini.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setShowConflictBanner(false)}>Pertahankan Lokal</Button>
            <Button size="sm" className="h-7 text-[10px]" onClick={triggerCloudSync}>Ambil dari Cloud</Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2.5 border bg-muted/20 rounded-lg px-3 h-9">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Cari berdasarkan judul invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none focus:ring-0 w-full"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <div className="flex items-center gap-1.5 border rounded-lg px-2 h-9 text-xs text-muted-foreground bg-card">
              <Calendar className="size-3.5 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-[10px] w-24 text-foreground"
              />
            </div>
            <span className="self-center text-xs text-muted-foreground">s/d</span>
            <div className="flex items-center gap-1.5 border rounded-lg px-2 h-9 text-xs text-muted-foreground bg-card">
              <Calendar className="size-3.5 shrink-0" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-[10px] w-24 text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Select all bar */}
      {filteredHistory.length > 0 && (
        <div className="flex justify-between items-center px-1 text-xs text-muted-foreground">
          <button onClick={handleSelectAll} className="flex items-center gap-1.5 hover:text-foreground font-semibold">
            {selectedIds.size === filteredHistory.length ? <CheckSquare className="size-4 text-primary" /> : <Square className="size-4" />}
            <span>Pilih Semua ({filteredHistory.length})</span>
          </button>
        </div>
      )}

      {/* History Items list */}
      <div className="flex flex-col gap-4">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-dashed rounded-xl min-h-60">
            <HistoryIcon className="size-10 text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-semibold">Riwayat kosong</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Tidak ada data transaksi yang ditemukan. Mulai buat dokumen di tab Manual untuk mengisi riwayat.
            </p>
          </div>
        ) : (
          filteredHistory.map((entry) => {
            const isSelected = selectedIds.has(entry.id);
            const isEditing = editingId === entry.id;
            const entryTotal = getEntryTotal(entry);

            return (
              <Card
                key={entry.id}
                className={cn(
                  "overflow-hidden transition-all duration-200 border hover:shadow-sm",
                  isSelected ? "border-primary bg-primary/5" : "bg-card"
                )}
              >
                <CardContent className="p-4 flex gap-3.5 text-xs">
                  {/* Checkbox selector */}
                  <button
                    onClick={() => handleToggleSelect(entry.id)}
                    className="shrink-0 self-center text-muted-foreground hover:text-primary mt-0.5"
                  >
                    {isSelected ? <CheckSquare className="size-4.5 text-primary" /> : <Square className="size-4.5" />}
                  </button>

                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Invoice Info */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 max-w-sm">
                          <Input
                            type="text"
                            value={editTitleInput}
                            onChange={(e) => setEditTitleInput(e.target.value)}
                            className="h-8 text-xs font-bold"
                          />
                          <Button size="icon" className="size-8 shrink-0" onClick={() => handleSaveTitleEdit(entry.id)}>
                            <Check className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-foreground truncate">{entry.title || 'Invoice Tanpa Judul'}</h3>
                          <button
                            onClick={() => handleStartEditingTitle(entry)}
                            className="text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <Edit2 className="size-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-muted-foreground font-medium mt-0.5">
                        <span>{entry.date}</span>
                        <span className="size-1 bg-border rounded-full" />
                        <span>{entry.items.length} Item Barang</span>
                        {entry.cardMode && (
                          <>
                            <span className="size-1 bg-border rounded-full" />
                            <span className="capitalize">{entry.cardMode} Mode</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Total & Action Buttons */}
                    <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 pt-3.5 md:pt-0">
                      <div className="text-left md:text-right flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Jumlah Total</span>
                        <span className="font-black text-primary text-sm">{formatCurrency(entryTotal)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-1 text-[10px] font-semibold" onClick={() => handleApplyToManual(entry)}>
                          <ExternalLink className="size-3" />
                          <span>Terapkan</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => {
                            if (window.confirm('Hapus transaksi ini dari riwayat?')) {
                              removeFromHistory(entry.id);
                            }
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
