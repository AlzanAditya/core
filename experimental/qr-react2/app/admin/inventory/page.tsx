"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { AppLayout } from "@/components/layouts"
import {
  countProductImages,
  createProduct,
  deleteProduct,
  emptyProductForm,
  formatDateTime,
  getProductPublicUrl,
  getProducts,
  Product,
  ProductFormData,
  ProductImageSlot,
  productToForm,
  updateProduct,
  uploadProductImage,
} from "@/lib/qr-api"
import { ArrowLeft, ExternalLink, ImageIcon, Pencil, Plus, Search, Trash2 } from "lucide-react"

const slots: Array<{ slot: ProductImageSlot; label: string }> = [
  { slot: "depan", label: "DEPAN" },
  { slot: "kanan", label: "KANAN" },
  { slot: "kiri", label: "KIRI" },
  { slot: "belakang", label: "BELAKANG" },
]

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"list" | "form">("list")
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyProductForm)
  const [imageFiles, setImageFiles] = useState<Partial<Record<ProductImageSlot, File>>>({})
  const [imagePreviews, setImagePreviews] = useState<Partial<Record<ProductImageSlot, string>>>({})
  const [saving, setSaving] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const imageComplete = useMemo(() => products.filter((product) => countProductImages(product) === 4).length, [products])

  async function loadProducts() {
    try {
      setLoading(true)
      setError("")
      const result = await getProducts({ page, pageSize, search: searchQuery })
      setProducts(result.data)
      setTotal(result.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat produk.")
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [page, pageSize, searchQuery])

  useEffect(() => {
    if (new URL(window.location.href).searchParams.get("action") === "create") {
      openAdd()
    }
  }, [])

  function setField<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setFormData((current) => ({ ...current, [key]: value }))
  }

  function resetImages(product?: Product | null) {
    Object.values(imagePreviews).forEach((url) => url && url.startsWith("blob:") && URL.revokeObjectURL(url))
    setImageFiles({})
    if (!product) {
      setImagePreviews({})
      return
    }
    setImagePreviews({
      depan: product.gambar_depan || undefined,
      kanan: product.gambar_kanan || undefined,
      kiri: product.gambar_kiri || undefined,
      belakang: product.gambar_belakang || undefined,
    })
  }

  function openAdd() {
    setEditProduct(null)
    setFormData(emptyProductForm)
    resetImages(null)
    setMode("form")
  }

  function openEdit(product: Product) {
    setEditProduct(product)
    setFormData(productToForm(product))
    resetImages(product)
    setMode("form")
  }

  function backToList() {
    setMode("list")
    setEditProduct(null)
    setFormData(emptyProductForm)
    resetImages(null)
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>, slot: ProductImageSlot) {
    const file = event.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setImageFiles((current) => ({ ...current, [slot]: file }))
    setImagePreviews((current) => {
      const old = current[slot]
      if (old?.startsWith("blob:")) URL.revokeObjectURL(old)
      return { ...current, [slot]: preview }
    })
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formData.nomor_seri.trim() || !formData.nama_produk.trim()) {
      toast.error("Nomor seri dan nama produk wajib diisi.")
      return
    }

    try {
      setSaving(true)
      const nomorSeri = editProduct?.nomor_seri || formData.nomor_seri.trim()
      if (editProduct) {
        await updateProduct(editProduct.nomor_seri, formData)
      } else {
        await createProduct(formData)
      }

      for (const { slot } of slots) {
        const file = imageFiles[slot]
        if (file) await uploadProductImage(file, nomorSeri, slot)
      }

      toast.success(editProduct ? "Produk berhasil diperbarui." : "Produk berhasil dibuat.")
      backToList()
      await loadProducts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan produk.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Hapus produk ${product.nomor_seri}?`)) return
    try {
      await deleteProduct(product.nomor_seri)
      toast.success("Produk berhasil dihapus.")
      await loadProducts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus produk.")
    }
  }

  const actions = (
    <button className="btn btn-primary" onClick={openAdd}>
      <Plus size={14} />
      Tambah
    </button>
  )

  return (
    <AppLayout title="Products" subtitle="Kelola semua produk ETS Asset Tracking." desktopActions={mode === "list" ? actions : null}>
      <section className={mode === "list" ? "mode-section active" : "mode-section"}>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon"><ImageIcon size={18} /></div>
            <div className="stat-card__label">Total Produk</div>
            <div className="stat-card__value">{total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon"><ImageIcon size={18} /></div>
            <div className="stat-card__label">Foto Lengkap</div>
            <div className="stat-card__value">{imageComplete}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon"><ImageIcon size={18} /></div>
            <div className="stat-card__label">Halaman Ini</div>
            <div className="stat-card__value">{products.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon"><ImageIcon size={18} /></div>
            <div className="stat-card__label">Perlu Foto</div>
            <div className="stat-card__value">{Math.max(total - imageComplete, 0)}</div>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={searchQuery}
              onChange={(event) => {
                setPage(1)
                setSearchQuery(event.target.value)
              }}
            />
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={14} />
            Tambah
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: "center" }}>No.</th>
                <th>No. Seri</th>
                <th>Nama Produk</th>
                <th>Tipe/ Kode</th>
                <th>Tahun</th>
                <th>Foto</th>
                <th>Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <tr><td colSpan={8}><div className="sk" style={{ height: 16, margin: "4px 0" }} /></td></tr>
                  <tr><td colSpan={8}><div className="sk" style={{ height: 16, margin: "4px 0", width: "80%" }} /></td></tr>
                  <tr><td colSpan={8}><div className="sk" style={{ height: 16, margin: "4px 0", width: "60%" }} /></td></tr>
                </>
              ) : error ? (
                <tr><td colSpan={8}>{error}</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8}>Belum ada produk.</td></tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product.nomor_seri}>
                    <td style={{ textAlign: "center" }}>{(page - 1) * pageSize + index + 1}</td>
                    <td className="mono">{product.nomor_seri}</td>
                    <td>{product.nama_produk}</td>
                    <td>{product.tipe_kode || "-"}</td>
                    <td>{product.tahun_pembuatan || "-"}</td>
                    <td><span className={countProductImages(product) === 4 ? "badge badge-green" : "badge badge-gray"}>{countProductImages(product)}/4 foto</span></td>
                    <td>{formatDateTime(product.created_at)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline btn-action" onClick={() => window.open(getProductPublicUrl(product.nomor_seri), "_blank")}><ExternalLink size={13} />Lihat</button>
                        <button className="btn btn-outline btn-action" onClick={() => openEdit(product)}><Pencil size={13} />Edit</button>
                        <button className="btn btn-danger btn-action" onClick={() => handleDelete(product)}><Trash2 size={13} />Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button className="pagination__btn" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Prev</button>
          <span className="pagination__info">Halaman {page} dari {totalPages}</span>
          <button className="pagination__btn" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button>
        </div>
      </section>

      <section className={mode === "form" ? "mode-section active" : "mode-section"}>
        <button className="back-link-admin" onClick={backToList}>
          <ArrowLeft size={14} />
          Kembali ke Daftar
        </button>
        <div className="form-page-title">{editProduct ? "Edit Produk" : "Tambah Produk Baru"}</div>

        <form onSubmit={handleSave} autoComplete="off">
          <div className="form-section">
            <div className="form-section__title">Identitas Produk</div>
            <div className="form-grid-2">
              <Field id="f-nama" label="Nama Produk" required value={formData.nama_produk} onChange={(value) => setField("nama_produk", value)} placeholder="cth. PowerShield Ultra 5000VA" />
              <Field id="f-tipe" label="Tipe / Kode" value={formData.tipe_kode} onChange={(value) => setField("tipe_kode", value)} placeholder="cth. Online DC, Offline" />
              <Field id="f-seri" label="Nomor Seri" required value={formData.nomor_seri} onChange={(value) => setField("nomor_seri", value)} placeholder="cth. SN-UPS-20240101" disabled={Boolean(editProduct)} />
              <Field id="f-tahun" label="Tahun Pembuatan" type="number" value={formData.tahun_pembuatan} onChange={(value) => setField("tahun_pembuatan", value)} placeholder="cth. 2026" />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__title">Spesifikasi Teknis</div>
            <div className="form-grid-2">
              <Field className="full" id="f-input" label="Input (Tegangan Masuk)" value={formData.input} onChange={(value) => setField("input", value)} placeholder="cth. 100-300VAC, 50/60Hz" />
              <Field className="full" id="f-output" label="Output (Tegangan Keluar)" value={formData.output} onChange={(value) => setField("output", value)} placeholder="cth. 220VAC +/-3%, 50Hz" />
              <Field id="f-frekuensi" label="Frekuensi" value={formData.frekuensi} onChange={(value) => setField("frekuensi", value)} placeholder="cth. 50Hz / 60Hz" />
              <Field id="f-socket" label="Jumlah Socket" type="number" value={formData.jumlah_socket} onChange={(value) => setField("jumlah_socket", value)} placeholder="cth. 4" />
              <Field className="full" id="f-range" label="Range Daya" value={formData.range_daya} onChange={(value) => setField("range_daya", value)} placeholder="cth. 500VA - 10000VA" />
              <Field id="f-soft" label="Soft Fuse Protection" value={formData.soft_fuse_protection} onChange={(value) => setField("soft_fuse_protection", value)} placeholder="cth. 16A" />
              <Field id="f-hard" label="Hard Fuse Protection" value={formData.hard_fuse_protection} onChange={(value) => setField("hard_fuse_protection", value)} placeholder="cth. 20A" />
              <Field className="full" id="f-ground" label="Ground Output" value={formData.ground_output} onChange={(value) => setField("ground_output", value)} placeholder="cth. Yes / No" />
              <div className="form-group full">
                <label className="form-label" htmlFor="f-tambahan">Tambahan / Optional</label>
                <textarea className="form-control" id="f-tambahan" value={formData.tambahan_optional} onChange={(event) => setField("tambahan_optional", event.target.value)} placeholder="Informasi tambahan, fitur khusus, dll." />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__title">Foto Produk</div>
            <div className="img-slots-grid">
              {slots.map(({ slot, label }) => (
                <div className="img-slot" key={slot}>
                  <input type="file" accept="image/*" onChange={(event) => handleImage(event, slot)} />
                  <div className="img-slot__placeholder">
                    <ImageIcon size={24} />
                    <span>{label}</span>
                  </div>
                  {imagePreviews[slot] && <img className="img-slot__preview visible" src={imagePreviews[slot]} alt="" />}
                  {imagePreviews[slot] && <div className="img-slot__badge">{imageFiles[slot] ? "BARU" : "TERSIMPAN"}</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="form-submit-bar">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan Produk"}</button>
            <button type="button" className="btn btn-outline" onClick={backToList}>Batal</button>
          </div>
        </form>
      </section>
    </AppLayout>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  type = "text",
  className = "",
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  type?: string
  className?: string
}) {
  return (
    <div className={`form-group ${className}`}>
      <label className="form-label" htmlFor={id}>{label}{required && <span className="req">*</span>}</label>
      <input className="form-control" id={id} type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  )
}
