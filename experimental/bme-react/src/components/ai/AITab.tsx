import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import type { AICard, InvoiceItem } from '../../types';
import { formatCurrency, formatNumberStr, cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Sparkles,
  Camera,
  Image as ImageIcon,
  Mic,
  Maximize2,
  Minimize2,
  Trash2,
  Save,
  ChevronDown,
  Loader2,
  X,
  Music,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface FileContext {
  name: string;
  mimeType: string;
  base64: string;
}

export const AITab: React.FC = () => {
  const { tabId } = useParams<{ tabId: string }>();
  
  const navigate = useNavigate();
  const {
    tabs,
    updateActiveTabData,
    addToHistory,
    settings,
    loading,
  } = useAppState();

  const activeTab = tabs.find(t => t.id === tabId);

  useEffect(() => {
    if (!loading && !activeTab) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, activeTab, navigate]);
  const cards: AICard[] = activeTab?.data?.aiCards || [];

  const [prompt, setPrompt] = useState('');
  const [isPromptMaximized, setIsPromptMaximized] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');
  const [loadingLabel, setLoadingLabel] = useState('');
  const [generating, setGenerating] = useState(false);

  // File Upload and Recording Contexts
  const [fileContext, setFileContext] = useState<FileContext | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordRequested, setRecordRequested] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Selection states
  const [selectModeActive, setSelectModeActive] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

  // Refs for media elements
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const handleUpdateCards = (updatedCards: AICard[]) => {
    updateActiveTabData({ aiCards: updatedCards });
  };

  // Camera/Gallery context handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isCamera = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileContext({
        name: file.name,
        mimeType: file.type,
        base64: reader.result as string
      });
      alert(isCamera ? "Foto dari kamera berhasil dimuat!" : "Gambar dari galeri berhasil dimuat!");
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Voice recording handlers
  const startRecording = async () => {
    if (isRecording || recordRequested) return;
    setRecordRequested(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeTypeOptions = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
      ];
      const supportedMime = mimeTypeOptions.find(m => MediaRecorder.isTypeSupported(m)) || '';

      const recorder = supportedMime
        ? new MediaRecorder(stream, { mimeType: supportedMime })
        : new MediaRecorder(stream);
      
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const baseMime = (recorder.mimeType || 'audio/webm').split(';')[0];
          const ext = baseMime.includes('ogg') ? 'ogg' : baseMime.includes('mp4') ? 'mp4' : 'webm';
          setFileContext({
            name: `rekaman-suara_${Date.now().toString().slice(-4)}.${ext}`,
            mimeType: baseMime,
            base64: reader.result as string
          });
        };

        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordRequested(false);
      alert("Sedang merekam suara...");
    } catch (err) {
      console.error("Gagal merekam suara:", err);
      setRecordRequested(false);
      setIsRecording(false);
      alert("Akses mikrofon ditolak atau tidak didukung browser ini");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      alert("Perekaman suara selesai.");
    }
  };

  // Generate Request wrapper
  const handleGenerate = async () => {
    if (!prompt.trim() && !fileContext) {
      alert("Silakan ketik deskripsi barang atau tambahkan berkas terlebih dahulu!");
      return;
    }

    setGenerating(true);
    let label = 'Generating...';
    if (fileContext) {
      if (fileContext.mimeType.startsWith('audio/')) label = 'Mentranskrip suara...';
      else if (fileContext.mimeType.startsWith('image/')) label = 'Menganalisis foto...';
    }
    setLoadingLabel(label);

    const payload = {
      prompt,
      model: selectedModel,
      systemInstruction: settings.aiDefaultPrompt
    } as any;

    if (fileContext) {
      payload.fileContext = {
        name: fileContext.name,
        mimeType: fileContext.mimeType,
        base64: fileContext.base64
      };
    }

    try {
      const response = await fetch('https://api.zanxa.studio/bme-api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Worker HTTP error! Status: ${response.status}`);
      }

      const resData = await response.json();
      if (resData.cards && Array.isArray(resData.cards)) {
        const parsedCards = resData.cards.map((c: any, index: number) => ({
          id: 'ai_card_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substring(2, 5),
          title: c.title || 'masukan judul',
          items: (c.items || []).map((item: any) => ({
            name: item.name || '...',
            tipe: item.tipe || '-',
            qtyUnit: item.qtyUnit || 'pcs',
            qty: parseInt(item.qty) || 1,
            price: parseInt(item.price) || 0,
            note: item.note || '...'
          })),
          isCollapsed: false
        }));

        handleUpdateCards(parsedCards);
        setFileContext(null); // Clear context file on success
        alert(`AI berhasil memproses ${parsedCards.length} data invoice!`);
      } else {
        throw new Error("Format respons JSON tidak valid dari Worker.");
      }
    } catch (e: any) {
      console.error(e);
      alert('Gagal memproses AI: ' + e.message);
    } finally {
      setGenerating(false);
      setLoadingLabel('');
    }
  };

  // Card items handlers
  const handleCardFieldChange = (cardIndex: number, itemIndex: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...cards];
    updated[cardIndex].items = updated[cardIndex].items.map((item, idx) => {
      if (idx === itemIndex) {
        return { ...item, [field]: value };
      }
      return item;
    });
    handleUpdateCards(updated);
  };

  const handleCardTitleChange = (cardIndex: number, value: string) => {
    const updated = [...cards];
    updated[cardIndex].title = value;
    handleUpdateCards(updated);
  };

  const handleDeleteCard = (cardIndex: number) => {
    if (window.confirm('Hapus invoice hasil generate ini?')) {
      const updated = cards.filter((_, idx) => idx !== cardIndex);
      handleUpdateCards(updated);
    }
  };

  const handleToggleCardCollapse = (cardIndex: number) => {
    const updated = [...cards];
    updated[cardIndex].isCollapsed = !updated[cardIndex].isCollapsed;
    handleUpdateCards(updated);
  };

  const handleSaveIndividualCard = async (cardIndex: number) => {
    const card = cards[cardIndex];
    if (!card.title.trim() || card.title === 'masukan judul') {
      alert('Isi judul invoice terlebih dahulu!');
      return;
    }

    try {
      await addToHistory({
        title: card.title,
        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        items: card.items,
        cardMode: 'simple'
      });
      alert('Berhasil menyimpan data invoice ke riwayat!');
    } catch (e: any) {
      alert('Gagal menyimpan: ' + e.message);
    }
  };

  // Selection handlers
  const handleCardSelectToggle = (id: string) => {
    setSelectedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveSelectedCards = async () => {
    const selected = cards.filter(c => selectedCardIds.has(c.id));
    if (selected.length === 0) return;

    try {
      for (const card of selected) {
        await addToHistory({
          title: card.title,
          date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          items: card.items,
          cardMode: 'simple'
        });
      }
      alert(`Berhasil menyimpan ${selected.length} invoice ke riwayat!`);
      setSelectedCardIds(new Set());
      setSelectModeActive(false);
    } catch (e: any) {
      alert('Gagal menyimpan: ' + e.message);
    }
  };

  const handleDeleteSelectedCards = () => {
    const selected = cards.filter(c => selectedCardIds.has(c.id));
    if (selected.length === 0) return;

    if (window.confirm(`Hapus ${selected.length} data invoice terpilih?`)) {
      const updated = cards.filter(c => !selectedCardIds.has(c.id));
      handleUpdateCards(updated);
      setSelectedCardIds(new Set());
      setSelectModeActive(false);
    }
  };

  if (!activeTab) return <div className="p-6">Memuat tab...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-20 relative text-xs">
      {/* 1. Prompt textbox area */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col gap-3">
          {/* File Context display */}
          {fileContext && (
            <div
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center justify-between border bg-primary/5 p-2 rounded-lg cursor-pointer max-w-sm"
            >
              <div className="flex items-center gap-2">
                {fileContext.mimeType.startsWith('image/') ? (
                  <img src={fileContext.base64} className="size-8 rounded object-cover shrink-0" alt="Context" />
                ) : (
                  <div className="flex size-8 items-center justify-center bg-primary/10 text-primary rounded shrink-0">
                    <Music className="size-4.5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold truncate text-[10px]">{fileContext.name}</p>
                  <p className="text-[8px] text-muted-foreground uppercase">{fileContext.mimeType}</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setFileContext(null);
                }}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}

          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={generating}
              placeholder="Contoh: Kabel NYM 50 meter harga 15rb, MCB 10 pcs harga 50rb..."
              className={cn(
                "text-xs leading-normal resize-none focus-visible:ring-primary",
                isPromptMaximized ? "min-h-40" : "min-h-20"
              )}
            />
          </div>

          {/* Action trigger row */}
          <div className="flex justify-between items-center border-t pt-3 mt-1.5 gap-3">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setIsPromptMaximized(!isPromptMaximized)}
                title={isPromptMaximized ? "Kecilkan" : "Besarkan"}
              >
                {isPromptMaximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </Button>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="flex h-7 w-28 rounded-md border border-input bg-transparent px-2 text-[10px] font-bold shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Lite</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange(e, true)}
              />
              <input
                type="file"
                ref={galleryInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, false)}
              />

              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => cameraInputRef.current?.click()}
                title="Buka Kamera"
              >
                <Camera className="size-4 text-muted-foreground" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => galleryInputRef.current?.click()}
                title="Pilih dari Galeri"
              >
                <ImageIcon className="size-4 text-muted-foreground" />
              </Button>

              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className={cn("size-8", isRecording && "animate-pulse")}
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? "Hentikan Rekaman" : "Mulai Rekaman"}
              >
                <Mic className="size-4 text-muted-foreground" />
              </Button>

              <Button
                disabled={generating}
                size="sm"
                className="h-8 gap-1 text-[10px] font-bold bg-primary shadow-[0_4px_12px_rgba(var(--primary),0.2)] ml-2"
                onClick={handleGenerate}
              >
                {generating ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                <span>{generating ? loadingLabel : 'Generate'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Output Generated Invoices */}
      {cards.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase px-1">
            <span>Hasil Ekstraksi AI</span>
            <span>{cards.length} Judul</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card, cardIndex) => {
              const isSelected = selectedCardIds.has(card.id);

              return (
                <Card
                  key={card.id}
                  onClick={() => selectModeActive && handleCardSelectToggle(card.id)}
                  className={cn(
                    "overflow-hidden border transition-all duration-200",
                    isSelected ? "border-primary bg-primary/5" : "bg-card",
                    selectModeActive && "cursor-pointer hover:scale-[1.005]"
                  )}
                >
                  <CardContent className="p-4 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-2">
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => handleCardTitleChange(cardIndex, e.target.value)}
                        className={cn(
                          "bg-transparent font-bold text-sm focus:outline-none border-b border-transparent focus:border-border w-44 truncate",
                          (!card.title || card.title === 'masukan judul') && "text-amber-500 border-dashed border-b-amber-500"
                        )}
                        placeholder="masukan judul"
                        onClick={(e) => selectModeActive && e.stopPropagation()}
                      />

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCardCollapse(cardIndex);
                          }}
                        >
                          <ChevronDown className={cn("size-4 transition-transform", !card.isCollapsed && "rotate-180")} />
                        </Button>
                        {!selectModeActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCard(cardIndex);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Card Items body */}
                    {!card.isCollapsed && (
                      <div className="flex flex-col gap-3 divide-y divide-dashed">
                        {card.items.map((item, itemIndex) => {
                          const showEmptyName = !item.name || item.name === '...';
                          const showEmptyPrice = !item.price || item.price <= 0;
                          
                          return (
                            <div key={itemIndex} className="flex flex-col gap-2 pt-2.5 first:pt-0" onClick={(e) => selectModeActive && e.stopPropagation()}>
                              <div className="flex flex-col gap-1">
                                <Label className="text-[9px] font-bold text-muted-foreground uppercase">Barang</Label>
                                <Input
                                  value={item.name}
                                  onChange={(e) => handleCardFieldChange(cardIndex, itemIndex, 'name', e.target.value)}
                                  placeholder="..."
                                  className={cn("h-7 text-[10px]", showEmptyName && "border-amber-500 bg-amber-500/5 focus:border-amber-500")}
                                />
                              </div>

                              <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-5 flex flex-col gap-1">
                                  <Label className="text-[9px] font-bold text-muted-foreground uppercase">Harga</Label>
                                  <Input
                                    type="text"
                                    value={item.price > 0 ? formatNumberStr(String(item.price)) : ''}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                                      handleCardFieldChange(cardIndex, itemIndex, 'price', val);
                                    }}
                                    placeholder="..."
                                    className={cn("h-7 text-[10px]", showEmptyPrice && "border-amber-500 bg-amber-500/5 focus:border-amber-500")}
                                  />
                                </div>
                                <div className="col-span-4 flex flex-col gap-1">
                                  <Label className="text-[9px] font-bold text-muted-foreground uppercase">Tipe</Label>
                                  <select
                                    value={item.tipe || ''}
                                    onChange={(e) => handleCardFieldChange(cardIndex, itemIndex, 'tipe', e.target.value)}
                                    className="flex h-7 w-full rounded-md border border-input bg-transparent px-2 text-[10px] shadow-sm"
                                  >
                                    <option value="-">-</option>
                                    <option value="ICA">ICA</option>
                                    <option value="Protecta">Protecta</option>
                                    <option value="Prolink">Prolink</option>
                                    <option value="APC">APC</option>
                                  </select>
                                </div>
                                <div className="col-span-3 flex flex-col gap-1 items-end">
                                  <div className="flex rounded border bg-muted/40 p-0.5 text-[8px] font-bold">
                                    <button
                                      onClick={() => handleCardFieldChange(cardIndex, itemIndex, 'qtyUnit', 'pcs')}
                                      className={cn("px-1 py-0.5 rounded-sm transition-colors", (item.qtyUnit || 'pcs') === 'pcs' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
                                    >
                                      Pcs
                                    </button>
                                    <button
                                      onClick={() => handleCardFieldChange(cardIndex, itemIndex, 'qtyUnit', 'lot')}
                                      className={cn("px-1 py-0.5 rounded-sm transition-colors", item.qtyUnit === 'lot' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
                                    >
                                      Lot
                                    </button>
                                  </div>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.qty}
                                    onChange={(e) => handleCardFieldChange(cardIndex, itemIndex, 'qty', parseInt(e.target.value) || 1)}
                                    className="h-7 text-center text-[10px] w-full mt-1 shrink-0"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Bottom actions (Hidden in Select mode) */}
                    {!selectModeActive && (
                      <div className="flex justify-between items-center border-t border-dashed pt-2.5 mt-1" onClick={(e) => e.stopPropagation()}>
                        <span className="font-bold text-primary">{formatCurrency(card.items.reduce((s, x) => s + x.price * x.qty, 0))}</span>
                        
                        <div className="flex items-center gap-1.5">
                          <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px] font-bold rounded-full" onClick={() => handleSaveIndividualCard(cardIndex)}>
                            <Save className="size-3" />
                            <span>Simpan</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* FLOAT ACTION BAR (SELECTIVE ACTIONS) */}
      {cards.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border p-3 flex justify-between items-center shadow-lg z-20 md:px-6">
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Status Pilihan</span>
            <span className="text-sm font-black text-primary">{selectModeActive ? `${selectedCardIds.size} Terpilih` : 'Mode Normal'}</span>
          </div>

          <div className="flex gap-2">
            {selectModeActive ? (
              <>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-full font-semibold text-destructive hover:text-destructive" onClick={handleDeleteSelectedCards}>
                  <Trash2 className="size-3.5" />
                  <span>Hapus</span>
                </Button>
                <Button size="sm" className="h-9 gap-1.5 text-xs rounded-full font-semibold" onClick={handleSaveSelectedCards}>
                  <Save className="size-3.5" />
                  <span>Simpan</span>
                </Button>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-full font-semibold border-primary text-primary" onClick={() => { setSelectModeActive(false); setSelectedCardIds(new Set()); }}>
                  <span>Kembali</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-full font-semibold" onClick={() => setSelectModeActive(true)}>
                  <span>Pilih Multiple</span>
                </Button>
                <Button
                  size="sm"
                  className="h-9 gap-1.5 text-xs rounded-full font-semibold bg-primary shadow-[0_4px_12px_rgba(var(--primary),0.3)]"
                  onClick={async () => {
                    // Save all logic
                    try {
                      for (const card of cards) {
                        await addToHistory({
                          title: card.title,
                          date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                          items: card.items,
                          cardMode: 'simple'
                        });
                      }
                      alert(`Berhasil menyimpan seluruh (${cards.length}) invoice ke riwayat!`);
                    } catch (e: any) {
                      alert('Gagal menyimpan: ' + e.message);
                    }
                  }}
                >
                  <Save className="size-3.5" />
                  <span>Simpan Semua</span>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* MULTIMODAL MEDIA PREVIEW DIALOG */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md w-[90%] rounded-xl text-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">Pratinjau Berkas Context</DialogTitle>
          </DialogHeader>

          {fileContext && (
            <div className="flex flex-col items-center justify-center p-4 min-h-48 mt-2 gap-4">
              {fileContext.mimeType.startsWith('image/') ? (
                <img
                  src={fileContext.base64}
                  className="max-w-full max-h-60 rounded-lg object-contain shadow"
                  alt="Context Preview"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Mic className="size-12 text-primary animate-pulse" />
                  <span className="font-semibold text-muted-foreground">{fileContext.name}</span>
                  <audio src={fileContext.base64} controls className="w-full mt-2" />
                </div>
              )}
              
              <Button size="sm" onClick={() => setIsPreviewOpen(false)} className="mt-2 w-full">Tutup</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
