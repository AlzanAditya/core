"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { PublicProductDetail } from "@/components/public-product-detail"

function ProductPageContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id") || ""
  return <PublicProductDetail nomorSeri={id} />
}

export default function ProductPage() {
  return (
    <Suspense fallback={
      <main className="product-main">
        <div className="sk sk-img" style={{ height: 260, marginBottom: 32, borderRadius: 12 }} />
        <div className="sk sk-title" style={{ height: 36, width: "55%", marginBottom: 16 }} />
        <div className="sk sk-line" style={{ height: 16, marginBottom: 10 }} />
        <div className="sk sk-line short" style={{ height: 16, width: "40%" }} />
      </main>
    }>
      <ProductPageContent />
    </Suspense>
  )
}
