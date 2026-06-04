"use client"

import { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Bell, Search, User, LayoutDashboard, Package, QrCode, ArrowLeftRight, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const menuItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Produk", href: "/inventory", icon: Package },
  { title: "QR", href: "/qr", icon: QrCode },
  { title: "Transaksi", href: "/transactions", icon: ArrowLeftRight },
  { title: "Setting", href: "/settings", icon: Settings },
]

interface MobileLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
  showSearch?: boolean
}

export function MobileLayout({ children, title, subtitle, actions, showSearch = false }: MobileLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex md:hidden flex-col min-h-screen bg-background">
      {/* Mobile Header - Compact */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-3 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Image
            src="https://qr.zanxa.studio/assets/ets-logo.png"
            alt="ETS"
            width={40}
            height={20}
            className="object-contain"
          />

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full p-0 text-[10px]">3</Badge>
            </Button>
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Search Bar - Optional */}
        {showSearch && (
          <div className="mt-2 relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari..."
              className="h-8 bg-secondary pl-8 text-xs"
            />
          </div>
        )}
      </header>

      {/* Mobile Content */}
      <main className="flex-1 overflow-auto px-3 py-3 pb-16">
        {/* Page Header */}
        <div className="mb-3">
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        {/* Actions */}
        {actions && <div className="mb-3">{actions}</div>}

        {/* Content */}
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-sidebar safe-area-inset-bottom">
        <div className="flex items-center justify-around py-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors min-w-[52px]",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                <span className="truncate">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
