"use client"

import { ReactNode } from "react"
import { DesktopLayout } from "./desktop-layout"

interface AppLayoutProps {
  children?: ReactNode
  desktopContent?: ReactNode
  mobileContent?: ReactNode
  title: string
  subtitle?: string
  desktopActions?: ReactNode
  mobileActions?: ReactNode
  showMobileSearch?: boolean
}

export function AppLayout({
  children,
  desktopContent,
  title,
  subtitle,
  desktopActions,
}: AppLayoutProps) {
  return (
    <DesktopLayout title={title} subtitle={subtitle} actions={desktopActions}>
      {desktopContent || children}
    </DesktopLayout>
  )
}
