"use client"

import { ReactNode } from "react"
import { DesktopLayout } from "./desktop-layout"
import { MobileLayout } from "./mobile-layout"

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
  mobileContent,
  title,
  subtitle,
  desktopActions,
  mobileActions,
  showMobileSearch = false,
}: AppLayoutProps) {
  return (
    <>
      <DesktopLayout title={title} subtitle={subtitle} actions={desktopActions}>
        {desktopContent || children}
      </DesktopLayout>
      <MobileLayout title={title} subtitle={subtitle} actions={mobileActions} showSearch={showMobileSearch}>
        {mobileContent || children}
      </MobileLayout>
    </>
  )
}
