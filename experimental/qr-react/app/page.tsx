import { AppLayout } from "@/components/layouts"
import {
  DesktopQuickActions,
  MobileQuickActions,
  DesktopStatsCards,
  MobileStatsCards,
  DesktopCharts,
  MobileChart,
  DesktopRecentActivity,
  MobileRecentActivity,
} from "@/components/dashboard"

// Desktop Dashboard Content
function DesktopDashboard() {
  return (
    <div className="space-y-6">
      <DesktopStatsCards />
      <DesktopCharts />
      <DesktopRecentActivity />
    </div>
  )
}

// Mobile Dashboard Content - Optimized for thumb reach and compact display
function MobileDashboard() {
  return (
    <div className="space-y-2.5">
      <MobileStatsCards />
      <MobileChart />
      <MobileRecentActivity />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AppLayout
      title="Dashboard"
      subtitle="Selamat datang di sistem manajemen gudang"
      desktopActions={<DesktopQuickActions />}
      mobileActions={<MobileQuickActions />}
      desktopContent={<DesktopDashboard />}
      mobileContent={<MobileDashboard />}
    />
  )
}
