"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const recentActivities = [
  {
    id: "TRX001",
    product: "PowerShield Ultra 5000VA",
    sku: "SN-UPS-20240101",
    type: "masuk",
    quantity: 25,
    location: "Rak A-01",
    time: "10 menit lalu",
  },
  {
    id: "TRX002",
    product: "StabilVolt Pro 3000",
    sku: "SN-STB-20240215",
    type: "keluar",
    quantity: 10,
    location: "Rak B-03",
    time: "25 menit lalu",
  },
  {
    id: "TRX003",
    product: "UPS Compact 1500VA",
    sku: "SN-UPS-20230901",
    type: "masuk",
    quantity: 50,
    location: "Rak A-02",
    time: "1 jam lalu",
  },
  {
    id: "TRX004",
    product: "Inverter Pure Sine 2000W",
    sku: "SN-INV-20240310",
    type: "keluar",
    quantity: 15,
    location: "Rak C-01",
    time: "2 jam lalu",
  },
  {
    id: "TRX005",
    product: "Stabilizer Industrial 10KVA",
    sku: "SN-STB-20240520",
    type: "masuk",
    quantity: 20,
    location: "Rak B-05",
    time: "3 jam lalu",
  },
]

export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 md:pb-4">
        <CardTitle className="text-base md:text-lg text-foreground">Aktivitas Terbaru</CardTitle>
        <p className="text-xs md:text-sm text-muted-foreground">
          Daftar transaksi barang masuk dan keluar terbaru
        </p>
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0">
        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{activity.product}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn(
                  "text-sm font-medium",
                  activity.type === "masuk" ? "text-primary" : "text-chart-2"
                )}>
                  {activity.type === "masuk" ? "+" : "-"}{activity.quantity}
                </span>
                <Badge
                  className={cn(
                    "text-[10px]",
                    activity.type === "masuk"
                      ? "bg-primary/10 text-primary"
                      : "bg-chart-2/10 text-chart-2"
                  )}
                >
                  {activity.type === "masuk" ? "IN" : "OUT"}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Produk</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">SKU</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Tipe</th>
                <th className="text-right text-xs font-medium text-muted-foreground pb-3">Jumlah</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Lokasi</th>
                <th className="text-right text-xs font-medium text-muted-foreground pb-3">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((activity) => (
                <tr key={activity.id} className="border-b border-border">
                  <td className="py-3 font-mono text-xs text-foreground">{activity.id}</td>
                  <td className="py-3 font-medium text-sm text-foreground max-w-[180px] truncate">{activity.product}</td>
                  <td className="py-3 text-xs text-muted-foreground">{activity.sku}</td>
                  <td className="py-3">
                    <Badge
                      className={cn(
                        "text-xs",
                        activity.type === "masuk"
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20"
                      )}
                    >
                      {activity.type === "masuk" ? "Masuk" : "Keluar"}
                    </Badge>
                  </td>
                  <td className="py-3 text-right font-medium text-sm text-foreground">{activity.quantity}</td>
                  <td className="py-3 text-xs text-muted-foreground">{activity.location}</td>
                  <td className="py-3 text-right text-xs text-muted-foreground">{activity.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
