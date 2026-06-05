"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getAllProducts, getProductPublicUrl, Product } from "@/lib/qr-api"
import { LockKeyhole } from "lucide-react"
import { QrScanner } from "@/components/qr-scanner"

export function PublicLanding() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")
  const [visibleCount, setVisibleCount] = useState(6)
  const [qrProduct, setQrProduct] = useState<Product | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)

  const visibleProducts = useMemo(() => products.slice(0, visibleCount), [products, visibleCount])

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat produk."))
      .finally(() => setLoading(false))
  }, [])

  function goToProduct() {
    const id = search.trim()
    if (!id) return
    window.location.href = `/product.html?id=${encodeURIComponent(id)}`
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="site-header">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Link href="/" style={{ display: "block", height: 32 }}>
            <img src="https://qr.zanxa.studio/assets/ets-logo.png" alt="ETS" className="site-logo" style={{ height: "100%" }} />
          </Link>
          <span style={{ fontSize: ".6rem", color: "var(--text-muted)", fontWeight: 500, marginTop: 4 }}>Protecting &amp; improving Electricity</span>
        </div>
        <Link href="/admin/login" id="admin-link" title="Admin Panel" className="back-link" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", border: "1px solid var(--green)", borderRadius: 99, fontSize: ".85rem", fontWeight: 500, color: "var(--green)", backgroundColor: "var(--green-light)", letterSpacing: ".08em" }}>
          <LockKeyhole size={16} />
          Admin
        </Link>
      </header>

      <main className="landing-main">
        <section className="hero">
          <div className="hero-eyebrow">INDUSTRIAL ASSET TRACKING v2.0</div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 700, lineHeight: 1.05, marginBottom: 14, color: "var(--text-main)" }}>
            Verifikasi Aset<br />via QR Code
          </h1>
          <div className="hero-sub">Masukkan nomor seri atau scan QR produk ETS untuk melihat spesifikasi teknis lengkap.</div>
        </section>

        <section className="search-card">
          <div className="search-label">CARI NOMOR SERI / ID PRODUK</div>
          <div className="search-row">
            <input
              className="id-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && goToProduct()}
              type="text"
              placeholder="SN-UPS-20240101"
              autoComplete="off"
              spellCheck={false}
            />
            <button className="go-btn" onClick={goToProduct}>CARI</button>
          </div>
          {error && <div className="search-error">{error}</div>}

          {/* Scanner trigger — same pattern as scanner.js injectTriggerBtn() */}
          <div className="scan-trigger-wrap">
            <button className="scan-btn" id="open-scanner-btn" onClick={() => setScannerOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 17v3M20 14v2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Scan QR Code dengan Kamera
            </button>
          </div>
        </section>

        <section className="demo-section">
          <div className="demo-label">PRODUK TERDAFTAR</div>
          <div className="demo-grid">
            {loading ? (
              <>
                <div className="demo-item sk" style={{ height: 80 }} />
                <div className="demo-item sk" style={{ height: 80 }} />
                <div className="demo-item sk" style={{ height: 80 }} />
              </>
            ) : (
              visibleProducts.map((product) => (
                <a key={product.nomor_seri} href={`/product.html?id=${encodeURIComponent(product.nomor_seri)}`} className="demo-item">
                  <span className="demo-id">{product.nomor_seri}</span>
                  <span className="demo-name">{product.nama_produk}</span>
                  <span className="demo-type">{product.tipe_kode || "Produk ETS"}</span>
                </a>
              ))
            )}
          </div>
          {visibleCount < products.length && (
            <button className="see-more-btn" onClick={() => setVisibleCount((count) => count + 6)}>Lihat lebih banyak ↓</button>
          )}
        </section>

        <section className="qr-section">
          <div className="section-label">QR CODE PRODUK</div>
          <div className="qr-cards">
            {loading ? (
              <>
                <div className="qr-card sk" style={{ height: 120 }} />
                <div className="qr-card sk" style={{ height: 120 }} />
                <div className="qr-card sk" style={{ height: 120 }} />
              </>
            ) : (
              products.slice(0, 3).map((product) => (
                <button key={product.nomor_seri} className="qr-card" onClick={() => setQrProduct(product)}>
                  <QRCodeSVG value={getProductPublicUrl(product.nomor_seri)} size={78} fgColor="#0a0a0a" />
                  <span>{product.nomor_seri}</span>
                </button>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© 2026 ETS — Industrial Asset Tracking</span>
        <span className="footer-domain">qr.zanxa.studio</span>
      </footer>

      {/* QR Preview Dialog */}
      <Dialog open={Boolean(qrProduct)} onOpenChange={(open) => !open && setQrProduct(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>{qrProduct?.nama_produk}</DialogTitle>
            <DialogDescription>{qrProduct?.nomor_seri}</DialogDescription>
          </DialogHeader>
          {qrProduct && (
            <div className="flex flex-col items-center gap-4">
              <QRCodeSVG value={getProductPublicUrl(qrProduct.nomor_seri)} size={180} fgColor="#0a0a0a" />
              <div className="qr-url">{getProductPublicUrl(qrProduct.nomor_seri)}</div>
              <button className="btn btn-primary" onClick={() => { window.location.href = `/product.html?id=${encodeURIComponent(qrProduct.nomor_seri)}` }}>Lihat Detail Produk</button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Camera Scanner */}
      <QrScanner open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  )
}
