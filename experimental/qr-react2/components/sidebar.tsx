"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  QrCode,
  ArrowLeftRight,
  ImageIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const mainMenuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/inventory",
    icon: Package,
  },
  {
    title: "QR Codes",
    href: "/qr",
    icon: QrCode,
  },
  {
    title: "Transaksi",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Images",
    href: "/images",
    icon: ImageIcon,
  },
]

const bottomMenuItems = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const renderMenuItem = (item: typeof mainMenuItems[0]) => {
    const isActive = pathname === item.href
    const menuContent = (
      <Link key={item.href} href={item.href}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-sidebar-accent text-primary"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{item.title}</span>}
        </div>
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip key={item.href} delayDuration={0}>
          <TooltipTrigger asChild>{menuContent}</TooltipTrigger>
          <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground border-sidebar-border">
            {item.title}
          </TooltipContent>
        </Tooltip>
      )
    }

    return menuContent
  }

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className="flex h-auto items-center justify-center border-b border-sidebar-border px-4 py-4">
          <div className="flex flex-col items-center gap-1">
            <Image
              src="https://qr.zanxa.studio/assets/ets-logo.png"
              alt="ETS Logo"
              width={collapsed ? 40 : 80}
              height={collapsed ? 20 : 40}
              className="object-contain"
            />
            {!collapsed && (
              <span className="text-[9px] text-sidebar-foreground/60 uppercase tracking-wider text-center leading-tight">
                Protecting & Improving<br />Electricity
              </span>
            )}
          </div>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 space-y-1 p-3">
          {mainMenuItems.map(renderMenuItem)}
        </nav>

        {/* Separator */}
        <div className="px-3">
          <Separator className="bg-sidebar-border" />
        </div>

        {/* Bottom Menu */}
        <nav className="space-y-1 p-3">
          {bottomMenuItems.map(renderMenuItem)}
        </nav>

        {/* Collapse Button */}
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
