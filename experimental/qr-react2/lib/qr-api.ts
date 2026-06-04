import { QR_CONFIG, QR_PUBLIC_BASE } from "@/lib/qr-config"

export type ProductImageSlot = "depan" | "kanan" | "kiri" | "belakang"

export interface Product {
  nomor_seri: string
  nama_produk: string
  tipe_kode: string | null
  tahun_pembuatan: number | null
  input: string | null
  output: string | null
  frekuensi: string | null
  jumlah_socket: number | null
  range_daya: string | null
  soft_fuse_protection: string | null
  hard_fuse_protection: string | null
  ground_output: string | null
  tambahan_optional: string | null
  gambar_depan: string | null
  gambar_kanan: string | null
  gambar_kiri: string | null
  gambar_belakang: string | null
  created_at: string | null
}

export interface ProductFormData {
  nomor_seri: string
  nama_produk: string
  tipe_kode: string
  tahun_pembuatan: string
  input: string
  output: string
  frekuensi: string
  jumlah_socket: string
  range_daya: string
  soft_fuse_protection: string
  hard_fuse_protection: string
  ground_output: string
  tambahan_optional: string
}

export interface ScanLog {
  id: number
  nomor_seri: string
  scanned_at: string | null
  user_agent: string | null
  ip_address: string | null
  referer: string | null
  products?: { nama_produk: string | null } | null
}

export interface PaginatedResult<T> {
  data: T[]
  count: number
}

export const emptyProductForm: ProductFormData = {
  nomor_seri: "",
  nama_produk: "",
  tipe_kode: "",
  tahun_pembuatan: "",
  input: "",
  output: "",
  frekuensi: "",
  jumlah_socket: "",
  range_daya: "",
  soft_fuse_protection: "",
  hard_fuse_protection: "",
  ground_output: "",
  tambahan_optional: "",
}

const PROJECT_REF = new URL(QR_CONFIG.SUPABASE_URL).hostname.split(".")[0]
const AUTH_STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`

function getStoredAccessToken() {
  if (typeof window === "undefined") return null

  const keys = [AUTH_STORAGE_KEY, ...Object.keys(localStorage).filter((key) => key.startsWith("sb-") && key.endsWith("-auth-token"))]
  for (const key of keys) {
    const raw = localStorage.getItem(key)
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw)
      const token = parsed?.access_token || parsed?.currentSession?.access_token
      if (token) return token as string
    } catch {
      continue
    }
  }

  return null
}

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(json?.error || json?.message || `HTTP ${res.status}`)
  }
  return json as T
}

async function supabaseRest<T>(path: string, options: RequestInit = {}, authenticated = false) {
  const token = authenticated ? getStoredAccessToken() : null
  if (authenticated && !token) {
    throw new Error("Session admin tidak ditemukan. Login lewat apps/qr/admin terlebih dahulu.")
  }

  const res = await fetch(`${QR_CONFIG.SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: QR_CONFIG.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || QR_CONFIG.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "count=exact",
      ...(options.headers || {}),
    },
  })

  const data = await parseResponse<T>(res)
  const contentRange = res.headers.get("content-range")
  const count = contentRange ? Number(contentRange.split("/").at(-1) || 0) : Array.isArray(data) ? data.length : 0
  return { data, count }
}

async function workerFetch<T>(path: string, options: RequestInit = {}) {
  const token = getStoredAccessToken()
  const res = await fetch(`${QR_CONFIG.WORKER_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  return parseResponse<{ success: boolean; data: T; count?: number }>(res)
}

function productSearchQuery(search: string) {
  const q = search.trim()
  if (!q) return ""
  const safe = q.replaceAll(",", " ").replaceAll("(", " ").replaceAll(")", " ")
  return `&or=(nama_produk.ilike.*${encodeURIComponent(safe)}*,nomor_seri.ilike.*${encodeURIComponent(safe)}*,tipe_kode.ilike.*${encodeURIComponent(safe)}*)`
}

export async function getProducts({ page = 1, pageSize = 10, search = "" } = {}) {
  const offset = (page - 1) * pageSize
  const path = `/products?select=*&order=created_at.desc&limit=${pageSize}&offset=${offset}${productSearchQuery(search)}`
  const result = await supabaseRest<Product[]>(path)
  return { data: result.data, count: result.count }
}

export async function getAllProducts() {
  const result = await supabaseRest<Product[]>("/products?select=*&order=created_at.desc&limit=1000")
  return result.data
}

export async function createProduct(data: ProductFormData) {
  const result = await workerFetch<Product>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  })
  return result.data
}

export async function updateProduct(nomorSeri: string, data: Partial<ProductFormData | Product>) {
  const result = await workerFetch<Product>(`/products/${encodeURIComponent(nomorSeri)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  return result.data
}

export async function deleteProduct(nomorSeri: string) {
  await workerFetch(`/products/${encodeURIComponent(nomorSeri)}`, { method: "DELETE" })
}

export async function getScanLogs({ page = 1, pageSize = 10, search = "" } = {}) {
  const offset = (page - 1) * pageSize
  const q = search.trim()
  const filter = q ? `&nomor_seri=ilike.*${encodeURIComponent(q)}*` : ""
  const path = `/scan_logs?select=*,products(nama_produk)&order=scanned_at.desc&limit=${pageSize}&offset=${offset}${filter}`
  const result = await supabaseRest<ScanLog[]>(path, {}, true)
  return { data: result.data, count: result.count }
}

export async function getAllScanLogs() {
  const result = await supabaseRest<ScanLog[]>("/scan_logs?select=*,products(nama_produk)&order=scanned_at.desc&limit=1000", {}, true)
  return result.data
}

export function getProductPublicUrl(nomorSeri: string) {
  return `${QR_PUBLIC_BASE}${encodeURIComponent(nomorSeri)}`
}

export function productImageSlots(product: Product) {
  return [
    { slot: "depan" as const, label: "Depan", url: product.gambar_depan },
    { slot: "kanan" as const, label: "Kanan", url: product.gambar_kanan },
    { slot: "kiri" as const, label: "Kiri", url: product.gambar_kiri },
    { slot: "belakang" as const, label: "Belakang", url: product.gambar_belakang },
  ]
}

export function countProductImages(product: Product) {
  return productImageSlots(product).filter((slot) => Boolean(slot.url)).length
}

export function productToForm(product: Product): ProductFormData {
  return {
    nomor_seri: product.nomor_seri || "",
    nama_produk: product.nama_produk || "",
    tipe_kode: product.tipe_kode || "",
    tahun_pembuatan: product.tahun_pembuatan ? String(product.tahun_pembuatan) : "",
    input: product.input || "",
    output: product.output || "",
    frekuensi: product.frekuensi || "",
    jumlah_socket: product.jumlah_socket ? String(product.jumlah_socket) : "",
    range_daya: product.range_daya || "",
    soft_fuse_protection: product.soft_fuse_protection || "",
    hard_fuse_protection: product.hard_fuse_protection || "",
    ground_output: product.ground_output || "",
    tambahan_optional: product.tambahan_optional || "",
  }
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export async function compressToWebP(file: File, maxW = 900, maxH = 600, quality = 0.82) {
  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, maxW / bitmap.width, maxH / bitmap.height)
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * ratio)
  canvas.height = Math.round(bitmap.height * ratio)
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas tidak tersedia.")
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("Kompresi gambar gagal."))
    }, "image/webp", quality)
  })
}

export async function uploadProductImage(file: File, nomorSeri: string, slot: ProductImageSlot) {
  const token = getStoredAccessToken()
  if (!token) throw new Error("Session admin tidak ditemukan. Login lewat apps/qr/admin terlebih dahulu.")

  const blob = await compressToWebP(file)
  const path = `${nomorSeri}/${slot}.webp`
  const res = await fetch(`${QR_CONFIG.SUPABASE_URL}/storage/v1/object/${QR_CONFIG.STORAGE_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: QR_CONFIG.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "image/webp",
      "x-upsert": "true",
    },
    body: blob,
  })

  await parseResponse(res)
  const publicUrl = `${QR_CONFIG.SUPABASE_URL}/storage/v1/object/public/${QR_CONFIG.STORAGE_BUCKET}/${path}`
  await updateProduct(nomorSeri, { [`gambar_${slot}`]: publicUrl } as Partial<Product>)
  return publicUrl
}

export async function clearProductImage(nomorSeri: string, slot: ProductImageSlot) {
  await updateProduct(nomorSeri, { [`gambar_${slot}`]: null } as Partial<Product>)
}
