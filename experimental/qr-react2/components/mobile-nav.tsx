"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  QrCode,
  ArrowLeftRight,
  ScanLine,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Produk",
    href: "/admin/inventory",
    icon: Package,
  },
  {
    title: "QR",
    href: "/admin/qr",
    icon: QrCode,
  },
  {
    title: "Scan",
    href: "/admin/scan",
    icon: ScanLine,
  },
  {
    title: "Transaksi",
    href: "/admin/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Setting",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-sidebar md:hidden">
      <div className="flex items-center justify-around py-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="truncate">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
