import React from 'react';
import { useAppState } from '../../hooks/useAppState';
import { formatCurrency } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Activity,
  Calendar,
  Package,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Finance: React.FC = () => {
  const { history } = useAppState();

  // 1. Calculate stats from history
  const getEntryTotal = (items: any[]) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item.price || 0) * (item.qty || 1), 0);
  };

  const totalRevenue = history.reduce((sum, entry) => sum + getEntryTotal(entry.items), 0);
  const averageTransaction = history.length > 0 ? Math.round(totalRevenue / history.length) : 0;
  const highestTransaction = history.length > 0 
    ? Math.max(...history.map(entry => getEntryTotal(entry.items))) 
    : 0;

  // 2. Group revenue by month for the bar chart
  const getMonthlyRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyTotals = Array(12).fill(0);

    history.forEach(entry => {
      // Date format is typically DD/MM/YYYY or YYYY-MM-DD
      // Try to parse month from date string
      const dateParts = entry.date.split('/');
      let monthIndex = -1;
      
      if (dateParts.length === 3) {
        // DD/MM/YYYY
        monthIndex = parseInt(dateParts[1]) - 1;
      } else {
        // Try standard Date parsing
        const parsedDate = new Date(entry.date);
        if (!isNaN(parsedDate.getTime())) {
          monthIndex = parsedDate.getMonth();
        }
      }

      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyTotals[monthIndex] += getEntryTotal(entry.items);
      }
    });

    return months.map((month, index) => ({
      month,
      total: monthlyTotals[index],
    }));
  };

  const monthlyRevenue = getMonthlyRevenueData();
  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map(d => d.total)) || 1;

  // 3. Segment analysis (brand breakdown or category breakdown)
  const getBrandBreakdown = () => {
    const brandCounts: Record<string, number> = {};
    let totalItems = 0;

    history.forEach(entry => {
      entry.items.forEach(item => {
        const brand = item.tipe || '-';
        if (brand !== '-') {
          brandCounts[brand] = (brandCounts[brand] || 0) + item.qty;
          totalItems += item.qty;
        }
      });
    });

    const segments = Object.entries(brandCounts).map(([label, qty]) => ({
      label,
      value: totalItems > 0 ? Math.round((qty / totalItems) * 100) : 0,
      color: label === 'ICA' ? '#3b82f6' : label === 'Protecta' ? '#ef4444' : label === 'Prolink' ? '#10b981' : '#f59e0b',
    }));

    // If no segment found, show guest fallback
    if (segments.length === 0) {
      return [
        { label: 'ICA', value: 40, color: '#3b82f6' },
        { label: 'Protecta', value: 30, color: '#ef4444' },
        { label: 'Prolink', value: 20, color: '#10b981' },
        { label: 'APC', value: 10, color: '#f59e0b' }
      ];
    }

    return segments;
  };

  const brandSegments = getBrandBreakdown();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-2 border-b pb-3">
        <BarChart3 className="size-5 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">Analisis Keuangan</h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Pendapatan</span>
              <span className="text-2xl font-black tracking-tight mt-0.5">{formatCurrency(totalRevenue)}</span>
              <span className="text-[10px] text-muted-foreground">akumulasi omset seluruh transaksi</span>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <DollarSign className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rata-rata Transaksi</span>
              <span className="text-2xl font-black tracking-tight mt-0.5">{formatCurrency(averageTransaction)}</span>
              <span className="text-[10px] text-muted-foreground">nilai rata-rata per invoice</span>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
              <Activity className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Transaksi Tertinggi</span>
              <span className="text-2xl font-black tracking-tight mt-0.5">{formatCurrency(highestTransaction)}</span>
              <span className="text-[10px] text-muted-foreground">nilai invoice terbesar</span>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Calendar className="size-4 text-primary" />
              <span>Pendapatan Bulanan</span>
            </CardTitle>
            <CardDescription className="text-[10px]">
              Distribusi omset total yang dikelompokkan berdasarkan bulan transaksi.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="flex items-end justify-between gap-2 h-44 border-b pb-1">
              {monthlyRevenue.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end">
                  <div
                    className={cn(
                      "w-full rounded-t-sm transition-all duration-200 group-hover:opacity-80",
                      d.total > 0 ? "bg-primary" : "bg-muted"
                    )}
                    style={{ height: d.total > 0 ? `${(d.total / maxMonthlyRevenue) * 90}%` : '4%' }}
                  />
                  {d.total > 0 && (
                    <div className="absolute -top-7 hidden group-hover:block z-10 bg-foreground text-background text-[9px] font-bold py-0.5 px-1.5 rounded shadow-lg whitespace-nowrap">
                      {formatCurrency(d.total)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-[9px] font-bold text-muted-foreground/70 mt-2">
              {monthlyRevenue.map((d, i) => (
                <span key={i} className="flex-1 text-center">{d.month}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Brand Segment breakdown donut/bar chart */}
        <Card className="shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Package className="size-4 text-primary" />
              <span>Breakdown Brand Terjual</span>
            </CardTitle>
            <CardDescription className="text-[10px]">
              Distribusi persentase kuantitas produk berdasarkan brand/merek.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2 flex flex-col gap-3">
            <div className="flex flex-col gap-3.5 mt-2">
              {brandSegments.map((seg, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                      <span>{seg.label}</span>
                    </div>
                    <span>{seg.value}%</span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: seg.color,
                        width: `${seg.value}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
