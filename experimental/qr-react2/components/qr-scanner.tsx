"use client"

import { useEffect, useRef, useState } from "react"

// ── Types ──────────────────────────────────────────────────────
declare global {
  interface Window {
    QrScanner: {
      new (
        video: HTMLVideoElement,
        onDecode: (result: { data: string }) => void,
        opts?: {
          preferredCamera?: string
          highlightScanRegion?: boolean
          highlightCodeOutline?: boolean
          maxScansPerSecond?: number
        }
      ): QrScannerInstance
      hasCamera(): Promise<boolean>
      listCameras(detail?: boolean): Promise<{ id: string; label: string }[]>
      scanImage(
        src: string | File | Blob | HTMLImageElement,
        opts?: { returnDetailedScanResult?: boolean; alsoTryWithoutScanRegion?: boolean }
      ): Promise<{ data: string }>
    }
    __scannerRetry?: () => void
  }
  interface QrScannerInstance {
    start(): Promise<void>
    stop(): void
    destroy(): void
    hasFlash(): Promise<boolean>
    turnFlashOn(): Promise<void>
    turnFlashOff(): Promise<void>
    setCamera(facingMode: string): Promise<void>
    _preferredCamera?: string
  }
}

// ── Helpers ─────────────────────────────────────────────────────
function beep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = "sine"; osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.25)
  } catch (_) {}
}

function vibrate() {
  try { navigator.vibrate && navigator.vibrate(60) } catch (_) {}
}

function isValidUrl(text: string) {
  try {
    const u = new URL(text)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch (_) { return false }
}

// ── Main component ───────────────────────────────────────────────
export function QrScanner({ open, onClose }: { open: boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScannerInstance | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canScanRef = useRef(true)

  const [loading, setLoading] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState("Membuka kamera...")
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)
  const [hasMultiCam, setHasMultiCam] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null)
  const [flashActive, setFlashActive] = useState(false)
  const [errorNode, setErrorNode] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string, type = "") {
    setToast({ msg, type })
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 2800)
  }

  function flashSuccess() {
    setFlashActive(true)
    setTimeout(() => setFlashActive(false), 250)
  }

  function onDecode(text: string) {
    if (!canScanRef.current || !text) return
    canScanRef.current = false

    if (isValidUrl(text)) {
      beep(); vibrate(); flashSuccess()
      showToast("QR berhasil dibaca! Mengalihkan...", "success")
      setTimeout(() => { window.location.href = text }, 600)
    } else {
      showToast("QR tidak berisi link valid: " + text.slice(0, 40), "error")
      setTimeout(() => { canScanRef.current = true }, 2500)
    }
  }

  function showCameraError(msg: string) {
    setLoading(true)
    setErrorNode(msg)
  }

  async function startCamera() {
    if (!videoRef.current) return
    setLoading(true)
    setLoadingMsg("Membuka kamera...")
    setErrorNode(null)
    canScanRef.current = true

    if (typeof window.QrScanner === "undefined") {
      showCameraError("Library QR Scanner tidak termuat. Coba refresh halaman.")
      return
    }

    const hasCamera = await window.QrScanner.hasCamera().catch(() => false)
    if (!hasCamera) {
      showCameraError("Kamera tidak ditemukan di perangkat ini.")
      return
    }

    try {
      const cameras = await window.QrScanner.listCameras(true)
      setHasMultiCam(cameras.length > 1)
    } catch (_) {}

    try {
      scannerRef.current = new window.QrScanner(
        videoRef.current,
        result => onDecode(result.data),
        { preferredCamera: "environment", highlightScanRegion: false, highlightCodeOutline: false, maxScansPerSecond: 8 }
      )
      await scannerRef.current.start()
      setLoading(false)

      const torch = await scannerRef.current.hasFlash().catch(() => false)
      setHasTorch(torch)
    } catch (err: unknown) {
      let msg = "Kamera gagal dibuka."
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.message?.includes("permission")) {
          msg = "Izin kamera ditolak. Izinkan akses kamera di pengaturan browser."
        } else if (err.name === "NotFoundError") {
          msg = "Kamera tidak ditemukan."
        } else if (location.protocol !== "https:" && location.hostname !== "localhost") {
          msg = "Scanner kamera memerlukan koneksi HTTPS."
        }
      }
      showCameraError(msg)
    }
  }

  function stopCamera() {
    if (!scannerRef.current) return
    scannerRef.current.stop()
    scannerRef.current.destroy()
    scannerRef.current = null
    if (videoRef.current) videoRef.current.classList.remove("loaded")
    setIsTorchOn(false)
  }

  async function toggleTorch() {
    if (!scannerRef.current || !hasTorch) return
    try {
      if (isTorchOn) {
        await scannerRef.current.turnFlashOff()
        setIsTorchOn(false)
      } else {
        await scannerRef.current.turnFlashOn()
        setIsTorchOn(true)
      }
    } catch (_) {}
  }

  async function switchCamera() {
    if (!scannerRef.current) return
    try {
      const current = scannerRef.current._preferredCamera || "environment"
      const next = current === "environment" ? "user" : "environment"
      await scannerRef.current.setCamera(next)
      scannerRef.current._preferredCamera = next
    } catch (_) {}
  }

  async function scanFromFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setLoadingMsg("Menganalisa gambar...")
    setErrorNode(null)

    try {
      const imageUrl = URL.createObjectURL(file)
      const result = await window.QrScanner.scanImage(imageUrl, {
        returnDetailedScanResult: true,
        alsoTryWithoutScanRegion: true,
      })
      URL.revokeObjectURL(imageUrl)
      setLoading(false)
      canScanRef.current = true
      onDecode(result.data)
    } catch (err: unknown) {
      setLoading(false)
      const errMsg = err instanceof Error ? err.message : "QR code tidak terdeteksi pada gambar"
      showToast(errMsg === "No QR code found" ? "QR code tidak terdeteksi pada gambar" : errMsg, "error")
    }
    e.target.value = ""
  }

  // Open/close effect
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      startCamera()
    } else {
      stopCamera()
      document.body.style.overflow = ""
    }
    return () => {
      stopCamera()
      document.body.style.overflow = ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // ESC key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // Load QrScanner library dynamically (once)
  useEffect(() => {
    if (typeof window !== "undefined" && !window.QrScanner) {
      const script = document.createElement("script")
      script.src = "https://unpkg.com/qr-scanner@1.4.2/qr-scanner.umd.min.js"
      script.async = true
      document.head.appendChild(script)
    }
  }, [])

  if (!open) return null

  return (
    <>
      {/* Success flash */}
      {flashActive && <div className="scan-success-flash active" />}

      {/* Toast */}
      {toast && (
        <div className={`scan-toast show${toast.type ? " " + toast.type : ""}`}>
          {toast.msg}
        </div>
      )}

      {/* Overlay */}
      <div className="scanner-overlay active">
        {/* Header */}
        <div className="scanner-header">
          <span className="scanner-title">SCAN QR CODE</span>
          <button className="scanner-close" onClick={onClose} aria-label="Tutup scanner">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l12 12M14 2L2 14" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="scanner-body">
          {loading && (
            <div className="scanner-loading">
              {errorNode ? (
                <>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef5350" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                  </svg>
                  <p style={{ color: "#f87171", textAlign: "center", maxWidth: "260px", lineHeight: 1.5 }}>{errorNode}</p>
                  <button
                    onClick={() => { setErrorNode(null); startCamera() }}
                    style={{ marginTop: 8, padding: "10px 24px", borderRadius: 8, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.8)", fontSize: ".8rem", cursor: "pointer" }}
                  >
                    Coba Lagi
                  </button>
                </>
              ) : (
                <>
                  <div className="scan-spinner" />
                  <p>{loadingMsg}</p>
                </>
              )}
            </div>
          )}
          <video ref={videoRef} id="scanner-video" playsInline muted className={loading ? "" : "loaded"} />
          <div className="scanner-cutout-wrap">
            <div className="scanner-frame">
              <div className="scanner-corners" />
              <div className="scan-line" />
            </div>
            <div className="scanner-hint">Arahkan QR code ke dalam frame</div>
          </div>
        </div>

        {/* Controls */}
        <div className="scanner-controls">
          <button className={`sc-btn${!hasTorch ? " hidden" : ""}${isTorchOn ? " active" : ""}`} onClick={toggleTorch} aria-label="Senter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 2h6l1 7H8L9 2z" strokeLinejoin="round" />
              <path d="M8 9l-1 13h10L16 9" strokeLinejoin="round" />
              <path d="M10 15l1.5 3L13 15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Senter
          </button>

          <button className={`sc-btn${!hasMultiCam ? " hidden" : ""}`} onClick={switchCamera} aria-label="Ganti kamera">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 7h-4l-2-3H10L8 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" strokeLinejoin="round" />
              <path d="M8 13a4 4 0 108 0" strokeLinecap="round" />
              <path d="M16 13l2-2-2-2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Ganti
          </button>

          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={scanFromFile} />
          <button className="sc-btn" onClick={() => fileInputRef.current?.click()} aria-label="Upload Foto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Galeri
          </button>
        </div>
      </div>
    </>
  )
}
