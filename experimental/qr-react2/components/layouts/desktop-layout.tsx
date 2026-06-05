"use client"

import { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"

interface DesktopLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function DesktopLayout({ children, title, subtitle, actions }: DesktopLayoutProps) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <header className="topbar" style={{ justifyContent: "flex-start", gap: 10 }}>
          <div className="topbar__title">{title}</div>
          <div style={{ flex: 1 }} />
          {actions}
          <div className="topbar__user">
            <span>Admin</span>
            <span className="topbar__avatar">A</span>
          </div>
        </header>
        <main className="page-content">
          <div className="page-header">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
