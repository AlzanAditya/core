"use client"

import Link from "next/link"
import { Plus, ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function QuickActions() {
  return (
    <div className="flex gap-2">
      <Button asChild size="sm" className="text-xs md:text-sm">
        <Link href="/admin/inventory?action=add">
          <Plus className="mr-1 md:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Tambah Produk</span>
          <span className="sm:hidden">Produk</span>
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm" className="text-xs md:text-sm">
        <Link href="/admin/transactions?action=add">
          <ArrowRightLeft className="mr-1 md:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Buat Transaksi</span>
          <span className="sm:hidden">Transaksi</span>
        </Link>
      </Button>
    </div>
  )
}
