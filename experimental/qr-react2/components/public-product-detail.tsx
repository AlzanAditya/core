"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { getProduct, getProductPublicUrl, Product, productImageSlots } from "@/lib/qr-api"
import { ArrowLeft, Copy, X } from "lucide-react"

export function PublicProductDetail({ nomorSeri }: { nomorSeri: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null)

  useEffect(() => {
    if (!nomorSeri) {
      setError("Nomor seri tidak ditemukan.")
      setLoading(false)
      return
    }

    getProduct(nomorSeri)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : "Produk tidak ditemukan."))
      .finally(() => setLoading(false))
  }, [nomorSeri])

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PublicHeader />
      {loading ? <SkeletonScreen /> : error || !product ? <ErrorScreen /> : (
        <ProductScreen product={product} copied={copied} setCopied={setCopied} setLightbox={setLightbox} />
      )}
      <Lightbox lightbox={lightbox} onClose={() => setLightbox(null)} />
      <footer className="site-footer">
        <span>(c) 2026 ETS - Industrial Asset Tracking</span>
        <span className="footer-domain">qr.zanxa.studio</span>
      </footer>
    </div>
  )
}

function PublicHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="back-link">
        <ArrowLeft size={14} />
        ETS Tracking
      </Link>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <img src="https://qr.zanxa.studio/assets/ets-logo.png" alt="ETS" className="site-logo" style={{ height: 28 }} />
        <span style={{ fontSize: ".6rem", color: "var(--text-muted)", fontWeight: 500, marginTop: 2 }}>Protecting & improving Electricity</span>
      </div>
    </header>
  )
}

function SkeletonScreen() {
  return (
    <main className="product-main">
      <div className="sk sk-img" style={{ height: 260, marginBottom: 32, borderRadius: 12 }} />
      <div className="sk sk-title" style={{ height: 36, width: "55%", marginBottom: 16 }} />
      <div className="sk sk-line" style={{ height: 16, marginBottom: 10 }} />
      <div className="sk sk-line short" style={{ height: 16, width: "40%" }} />
    </main>
  )
}

function ErrorScreen() {
  return (
    <main className="product-main">
      <div className="error-screen">
        <div className="error-code">404</div>
        <div className="error-title">Produk tidak ditemukan</div>
        <div className="error-sub">Nomor seri yang kamu cari tidak terdaftar dalam sistem ETS.</div>
        <Link href="/" className="error-btn">Kembali ke Pencarian</Link>
      </div>
    </main>
  )
}

function ProductScreen({
  product,
  copied,
  setCopied,
  setLightbox,
}: {
  product: Product
  copied: boolean
  setCopied: (copied: boolean) => void
  setLightbox: (image: { src: string; label: string } | null) => void
}) {
  const publicUrl = getProductPublicUrl(product.nomor_seri)
  const fields = [
    ["NOMOR SERI", product.nomor_seri, "mono"],
    ["TAHUN", product.tahun_pembuatan, ""],
    ["INPUT", product.input, ""],
    ["OUTPUT", product.output, ""],
    ["FREKUENSI", product.frekuensi, ""],
    ["JUMLAH SOCKET", product.jumlah_socket, ""],
    ["RANGE DAYA", product.range_daya, ""],
    ["SOFT FUSE", product.soft_fuse_protection, ""],
    ["HARD FUSE", product.hard_fuse_protection, ""],
    ["GROUND OUTPUT", product.ground_output, ""],
  ]
  const photos = productImageSlots(product).filter((slot) => slot.url)

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <main className="product-main">
      {product.gambar_depan && (
        <div className="product-cover-wrap">
          <img className="product-cover-img" src={product.gambar_depan} alt={product.nama_produk} />
        </div>
      )}

      <section className="product-top">
        <div className="product-info">
          <div className="info-header">
            {product.tipe_kode && <div className="product-type-tag">{product.tipe_kode}</div>}
          </div>
          <div className="product-name">{product.nama_produk}</div>
        </div>

        <div className="product-details-row">
          <div className="details-left">
            <div className="info-grid">
              {fields.map(([label, value, kind]) => (
                <div className="info-item" key={String(label)}>
                  <div className="info-key">{label}</div>
                  <div className={`info-val ${kind}`}>{value || "-"}</div>
                </div>
              ))}
            </div>

            {product.tambahan_optional && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".6rem", letterSpacing: ".15em", color: "var(--text-muted)", marginBottom: 8 }}>TAMBAHAN / OPTIONAL</div>
                <div style={{ fontSize: ".875rem", lineHeight: 1.7, color: "var(--text-sub)", whiteSpace: "pre-wrap" }}>{product.tambahan_optional}</div>
              </div>
            )}
          </div>

          <aside className="details-right">
            <div className="qr-panel">
              <div className="demo-label qr-panel-title" style={{ marginBottom: 0 }}>QR CODE</div>
              <div className="qr-panel-left">
                <QRCodeSVG value={publicUrl} size={150} fgColor="#0a0a0a" />
              </div>
              <div className="qr-panel-right">
                <div style={{ fontSize: ".875rem", fontWeight: 600, marginBottom: 4, color: "var(--text-main)" }}>{product.nomor_seri}</div>
                <div className="qr-url">{publicUrl}</div>
              </div>
              <button className={`copy-link-btn ${copied ? "copied" : ""}`} onClick={copyLink}>
                <Copy size={11} />
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </aside>
        </div>
      </section>

      {photos.length > 0 && (
        <section className="gallery-section">
          <div className="section-label">FOTO PRODUK</div>
          <div className="gallery-grid">
            {photos.map((photo) => (
              <button key={photo.slot} className="gallery-item" onClick={() => setLightbox({ src: photo.url!, label: photo.label })}>
                <img className="gallery-img" src={photo.url!} alt={photo.label} />
                <span className="gallery-label">{photo.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function Lightbox({
  lightbox,
  onClose,
}: {
  lightbox: { src: string; label: string } | null
  onClose: () => void
}) {
  return (
    <div className={`lightbox-overlay ${lightbox ? "active" : ""}`} onClick={onClose}>
      <div className="lightbox-inner" onClick={(event) => event.stopPropagation()}>
        <button className="lb-close" onClick={onClose}><X size={18} /></button>
        <div className="lightbox-img-wrap">
          {lightbox && <img className="lightbox-img" src={lightbox.src} alt={lightbox.label} />}
        </div>
      </div>
    </div>
  )
}
