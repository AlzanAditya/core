"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ImageIcon, LayoutDashboard, LogOut, Package, QrCode, ScanLine, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const mainMenuItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Products", href: "/admin/inventory", icon: Package },
  { title: "QR Codes", href: "/admin/qr", icon: QrCode },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Media", href: "/admin/images", icon: ImageIcon },
  { title: "Scan", href: "/admin/scan", icon: ScanLine },
]

const bottomMenuItems = [
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <img src="https://qr.zanxa.studio/assets/ets-logo.png" alt="ETS" />
      </div>
      <nav className="sidebar__nav">
        {mainMenuItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={cn("sidebar__item", active && "active")}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          )
        })}
        <div className="sidebar__divider" />
        {bottomMenuItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={cn("sidebar__item", active && "active")}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>
      <div className="sidebar__footer">
        <Link href="/admin/login" className="sidebar__logout">
          <LogOut />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  )
}
