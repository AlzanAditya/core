import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import {
  Printer,
  Download,
  Edit2,
  Check,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';
import { exportToPNG, exportToJPEG } from '../../lib/imageExporter';
import { useAppState } from '../../hooks/useAppState';
import { cn } from '../../lib/utils';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  title: string;
  type: 'invoice' | 'surat';
  onSaveEdits?: (editedHtml: string) => void;
  showEditButton?: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  html,
  title,
  type,
  onSaveEdits,
  showEditButton = true,
}) => {
  const { settings } = useAppState();
  const [editedHtml, setEditedHtml] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showConfirmSkip, setShowConfirmSkip] = useState<boolean>(false);

  // Zoom and Pan states
  const [zoom, setZoom] = useState<number>(0.6);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Touch & Mouse event tracking refs
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialDistanceRef = useRef<number>(0);
  const initialZoomRef = useRef<number>(0.6);
  const lastPanCenterRef = useRef<{ x: number; y: number } | null>(null);

  // Sync state on HTML change
  useEffect(() => {
    setEditedHtml(html);
    setIsEditing(false);
  }, [html, isOpen]);

  // Adjust zoom to fit container size when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (wrapperRef.current) {
          const refWidth = 794;
          const refHeight = 1123;
          const wrapperWidth = wrapperRef.current.clientWidth;
          const wrapperHeight = wrapperRef.current.clientHeight;

          const fitScale = Math.min(wrapperWidth / refWidth, wrapperHeight / refHeight) * 0.95;
          setZoom(Math.max(0.3, Math.min(1.2, fitScale)));
          setPan({ x: 0, y: 0 });
        }
      }, 150);
    }
  }, [isOpen]);

  // Sync edits inside iframe to parent/local state
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !isEditing) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const handleInput = () => {
      const currentDocHtml =
        '<!DOCTYPE html>\n<html lang="id">\n' +
        iframeDoc.documentElement.innerHTML +
        '\n</html>';
      setEditedHtml(currentDocHtml);
      if (onSaveEdits) {
        onSaveEdits(currentDocHtml);
      }
    };

    iframeDoc.body.addEventListener('input', handleInput);
    return () => {
      iframeDoc.body.removeEventListener('input', handleInput);
    };
  }, [isEditing, onSaveEdits]);

  // Handle editing toggling
  const handleToggleEditing = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    if (isEditing) {
      // Turn off editing
      iframeDoc.body.contentEditable = 'false';
      iframeDoc.body.style.outline = 'none';
      setIsEditing(false);
    } else {
      // Check if user confirmed edit warning once
      const skipConfirm = localStorage.getItem('skipEditConfirm') === 'true';
      if (skipConfirm) {
        enableIframeEditing(iframeDoc);
      } else {
        setShowConfirmSkip(true);
      }
    }
  };

  const enableIframeEditing = (doc: Document) => {
    doc.body.contentEditable = 'true';
    doc.body.style.outline = '2px dashed #f5a623'; // Warm orange outline for edit mode
    doc.body.style.outlineOffset = '-2px';
    doc.body.focus();
    setIsEditing(true);
  };

  const handleConfirmEdit = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('skipEditConfirm', 'true');
    }
    setShowConfirmSkip(false);
    const iframe = iframeRef.current;
    if (!iframe) return;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      enableIframeEditing(iframeDoc);
    }
  };

  const handleResetEdits = () => {
    if (window.confirm('Kembalikan dokumen ke format otomatis asli? Semua editan kustom Anda akan hilang.')) {
      setEditedHtml(html);
      setIsEditing(false);
      if (onSaveEdits) {
        onSaveEdits(html);
      }
      // Reload iframe content
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.srcdoc = html;
      }
    }
  };

  // Zoom & Pan Wheel handlers
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isEditing) return; // Prevent zooming during editing for better user typing focus
    e.preventDefault();
    const zoomFactor = 0.05;
    const nextZoom = Math.max(0.3, Math.min(1.5, zoom - Math.sign(e.deltaY) * zoomFactor));
    setZoom(nextZoom);
  };

  // Pointer Events for Panning & Pinching
  const getDistance = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return 0;
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (pts: { x: number; y: number }[]) => {
    if (pts.length === 1) return { x: pts[0].x, y: pts[0].y };
    if (pts.length >= 2) return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    return { x: 0, y: 0 };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditing) return; // Prevent pan during typing in iframe
    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.setPointerCapture(e.pointerId);
    }

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(pointersRef.current.values());
    lastPanCenterRef.current = getCenter(pts);

    if (pts.length === 2) {
      initialDistanceRef.current = getDistance(pts);
      initialZoomRef.current = zoom;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditing) return;
    if (!pointersRef.current.has(e.pointerId)) return;

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(pointersRef.current.values());
    const center = getCenter(pts);

    // Pan calculation
    if (lastPanCenterRef.current) {
      const dx = center.x - lastPanCenterRef.current.x;
      const dy = center.y - lastPanCenterRef.current.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
    lastPanCenterRef.current = center;

    // Pinch Zoom calculation
    if (pts.length === 2 && initialDistanceRef.current > 0) {
      const dist = getDistance(pts);
      if (dist > 0) {
        const nextZoom = initialZoomRef.current * (dist / initialDistanceRef.current);
        setZoom(Math.max(0.3, Math.min(1.5, nextZoom)));
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    const pts = Array.from(pointersRef.current.values());

    if (pts.length < 2) {
      initialDistanceRef.current = 0;
    }
    if (pts.length > 0) {
      lastPanCenterRef.current = getCenter(pts);
    } else {
      lastPanCenterRef.current = null;
    }
  };

  // Actions: Download and Print
  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(editedHtml);
    w.document.close();
    w.document.title = title;
    
    // Auto-focus and open print window
    setTimeout(() => {
      w.focus();
      w.print();
    }, 300);
  };

  const handleDownloadFile = async () => {
    const method = settings.defaultDownloadMethod || 'pdf';

    if (method === 'pdf') {
      handlePrint();
    } else {
      // Determine file format and filename
      const formats = settings.fileNameFormat || {
        invoice: 'Invoice-{judul}',
        suratJalan: 'Surat Jalan-{judul}',
      };
      const template = type === 'surat' ? formats.suratJalan : formats.invoice;
      const now = new Date();
      const filename = template
        .replace(/\{judul\}/gi, title || 'Untitled')
        .replace(/%YYYY/g, String(now.getFullYear()))
        .replace(/%MM/g, String(now.getMonth() + 1).padStart(2, '0'))
        .replace(/%DD/g, String(now.getDate()).padStart(2, '0'))
        .replace(/%HH/g, String(now.getHours()).padStart(2, '0'))
        .replace(/%mm/g, String(now.getMinutes()).padStart(2, '0'))
        .replace(/%ss/g, String(now.getSeconds()).padStart(2, '0'));

      if (method === 'jpeg') {
        await exportToJPEG(editedHtml, filename);
      } else {
        await exportToPNG(editedHtml, filename);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-background text-foreground rounded-2xl border border-border shadow-2xl">
        
        {/* Modal Toolbar */}
        <DialogHeader className="p-4 border-b border-border bg-card flex flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex flex-col gap-0.5 max-w-sm md:max-w-md">
            <DialogTitle className="text-sm font-bold tracking-tight truncate flex items-center gap-1.5">
              <span>{title || 'Pratinjau Dokumen'}</span>
              {editedHtml !== html && (
                <span className="inline-flex items-center gap-0.5 bg-amber-500/10 text-amber-500 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase">
                  Edited
                </span>
              )}
            </DialogTitle>
            <p className="text-[10px] text-muted-foreground truncate uppercase font-medium">
              {type === 'invoice' ? 'Faktur Tagihan (Invoice)' : 'Surat Pengantar Barang (Surat Jalan)'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Zoom Controls */}
            {!isEditing && (
              <div className="hidden md:flex items-center border rounded-lg bg-background p-0.5 mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
                  title="Perkecil"
                >
                  <ZoomOut className="size-3.5" />
                </Button>
                <span className="text-[10px] font-bold px-2 w-10 text-center text-muted-foreground select-none">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                  title="Perbesar"
                >
                  <ZoomIn className="size-3.5" />
                </Button>
              </div>
            )}

            {/* Reset Edits */}
            {editedHtml !== html && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px] gap-1 px-2.5 hover:text-destructive border-dashed"
                onClick={handleResetEdits}
              >
                <RotateCcw className="size-3" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}

            {/* Edit Button */}
            {showEditButton && (
              <Button
                variant={isEditing ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "h-8 text-[10px] gap-1 px-2.5",
                  isEditing && "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-md"
                )}
                onClick={handleToggleEditing}
              >
                {isEditing ? <Check className="size-3.5" /> : <Edit2 className="size-3" />}
                <span>{isEditing ? 'Selesai Edit' : 'Edit Teks'}</span>
              </Button>
            )}

            {/* Print Trigger */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[10px] gap-1 px-2.5"
              onClick={handlePrint}
              disabled={isEditing}
            >
              <Printer className="size-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </Button>

            {/* Download Button */}
            <Button
              size="sm"
              className="h-8 text-[10px] gap-1 px-3 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-lg shadow-sm"
              onClick={handleDownloadFile}
              disabled={isEditing}
            >
              <Download className="size-3.5" />
              <span>Unduh</span>
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Modal Body / Canvas */}
        <div
          ref={wrapperRef}
          className={cn(
            "flex-1 bg-muted/20 relative overflow-hidden select-none flex items-center justify-center p-4",
            isEditing ? "cursor-text" : "cursor-grab active:cursor-grabbing"
          )}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* A4 Container inside scale & pan */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              width: '794px',
              height: '1123px',
              transition: isEditing ? 'transform 0.15s ease-out' : 'none',
            }}
            className="bg-white shadow-xl border border-neutral-300 rounded-sm overflow-hidden shrink-0"
          >
            <iframe
              ref={iframeRef}
              srcDoc={editedHtml}
              className="w-full h-full border-none pointer-events-auto"
              style={{
                pointerEvents: isEditing ? 'auto' : 'none',
              }}
              title="Preview A4"
            />
          </div>

          {/* Floating Helper */}
          {isEditing ? (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-10 animate-pulse">
              <Sparkles className="size-3.5" />
              <span>Klik teks di dalam dokumen untuk mulai mengedit langsung</span>
            </div>
          ) : (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white/90 text-[9px] font-bold px-3 py-1 rounded-full shadow-lg pointer-events-none select-none z-10">
              Gunakan scroll wheel / pinch untuk zoom. Geser untuk pan.
            </div>
          )}
        </div>
      </DialogContent>

      {/* Confirmation Dialog for editing warning */}
      <Dialog open={showConfirmSkip} onOpenChange={setShowConfirmSkip}>
        <DialogContent className="max-w-md w-[90%] rounded-2xl text-xs p-5 bg-background text-foreground border border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-amber-500">Peringatan Mode Edit</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-muted-foreground leading-relaxed text-xs">
              Anda memasuki **Mode Edit Bebas**. Perubahan teks di sini akan diaplikasikan saat diunduh, tetapi **tidak akan disimpan secara permanen** di dalam item riwayat transaksi database Anda.
            </p>
            <p className="text-muted-foreground leading-relaxed text-xs font-semibold">
              Jika Anda mengubah data barang atau harga di sini, pastikan untuk mengunduh berkasnya sekarang juga sebelum keluar.
            </p>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="dont-show-again"
                className="size-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="dont-show-again" className="text-[10px] text-muted-foreground cursor-pointer font-medium select-none">
                Jangan tampilkan peringatan ini lagi.
              </label>
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px]"
                onClick={() => setShowConfirmSkip(false)}
              >
                Batal
              </Button>
              <Button
                size="sm"
                className="h-8 text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                onClick={() => {
                  const cb = document.getElementById('dont-show-again') as HTMLInputElement | null;
                  handleConfirmEdit(cb?.checked || false);
                }}
              >
                Lanjutkan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
