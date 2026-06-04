import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import { formatCurrency, cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  FileText,
  Sparkles,
  BarChart3,
  History as HistoryIcon,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    history,
    templates,
    tabs,
    settings,
    isLoggedIn,
    adminProfile,
    createNewTab,
  } = useAppState();

  // Calculate total revenue
  const totalRevenue = history.reduce((sum, entry) => {
    if (entry.items && Array.isArray(entry.items)) {
      return sum + entry.items.reduce((itemSum, item) => itemSum + (item.price || 0) * (item.qty || 0), 0);
    }
    return sum;
  }, 0);

  const monthlyTarget = settings.monthlyTarget || 3800000;
  const progressPercent = Math.min(100, Math.round((totalRevenue / monthlyTarget) * 100)) || 0;

  const handleShortcutClick = (mode: 'manual' | 'ai' | 'finance' | 'history' | 'settings') => {
    if (mode === 'settings') {
      navigate('/settings');
      return;
    }

    const existing = tabs.find(t => t.mode === mode);
    if (existing) {
      navigate(`/${mode}/${existing.id}`);
    } else {
      const newTab = createNewTab(mode as any);
      navigate(`/${mode}/${newTab.id}`);
    }
  };

  const getProfileName = () => {
    if (isLoggedIn && adminProfile) {
      return adminProfile.full_name || 
             adminProfile.user_metadata?.full_name || 
             adminProfile.raw_user_meta_data?.full_name || 
             'Administrator';
    }
    return 'Guest';
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Welcome Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Halo, {getProfileName()}!</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selamat datang di Berkah Maju Elektrik Invoice &amp; Surat Jalan Generator.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="size-3.5" />
              <span>Cloud Connected</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertCircle className="size-3.5" />
              <span>Guest Mode</span>
            </div>
          )}
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Zap className="size-3.5" />
            <span>{tabs.length} Tab Aktif</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <Card className="md:col-span-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col justify-between h-full min-h-48">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Omset Bisnis</p>
                <h3 className="text-3xl font-black tracking-tight mt-1">{formatCurrency(totalRevenue)}</h3>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="size-5" />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Progres Target Bulanan</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border/20">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Target: {formatCurrency(monthlyTarget)}</span>
                <span>Sisa: {formatCurrency(Math.max(0, monthlyTarget - totalRevenue))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Counter cards in column */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Histori</span>
                <span className="text-3xl font-extrabold tracking-tight">{history.length}</span>
                <span className="text-[10px] text-muted-foreground">dokumen disimpan</span>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <HistoryIcon className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Template</span>
                <span className="text-3xl font-extrabold tracking-tight">{templates.length}</span>
                <span className="text-[10px] text-muted-foreground">reusable presets</span>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                <FileText className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick shortcuts */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Aksi Cepat &amp; Pintar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'manual',
              title: 'Generator Manual',
              desc: 'Buat invoice & surat jalan secara konvensional langkah demi langkah.',
              icon: <FileText className="size-5 text-blue-500" />,
              bg: 'bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20'
            },
            {
              id: 'ai',
              title: 'Ekstraktor Pintar AI',
              desc: 'Salin teks mentah/faktur, biarkan kecerdasan buatan menyusun data Anda otomatis.',
              icon: <Sparkles className="size-5 text-purple-500" />,
              bg: 'bg-purple-500/5 hover:bg-purple-500/10 border-purple-500/20'
            },
            {
              id: 'finance',
              title: 'Laporan Keuangan',
              desc: 'Analisis tren pendapatan, monitoring target bulanan, dan evaluasi grafik.',
              icon: <BarChart3 className="size-5 text-green-500" />,
              bg: 'bg-green-500/5 hover:bg-green-500/10 border-green-500/20'
            },
            {
              id: 'history',
              title: 'Pencarian Riwayat',
              desc: 'Cari, cetak ulang, ekspor, atau edit kembali invoice & surat jalan terdahulu.',
              icon: <HistoryIcon className="size-5 text-orange-500" />,
              bg: 'bg-orange-500/5 hover:bg-orange-500/10 border-orange-500/20'
            },
            {
              id: 'settings',
              title: 'Pengaturan Sistem',
              desc: 'Kelola format nama berkas, ubah bahasa, prompt default AI, dan data administrasi.',
              icon: <SettingsIcon className="size-5 text-muted-foreground" />,
              bg: 'bg-muted/10 hover:bg-muted/20 border-border'
            }
          ].map((s) => (
            <Card
              key={s.id}
              onClick={() => handleShortcutClick(s.id as any)}
              className={cn("cursor-pointer border transition-all hover:scale-[1.01] hover:shadow-sm", s.bg)}
            >
              <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0">
                <div className="p-2 rounded-lg bg-background border shrink-0">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xs font-bold">{s.title}</CardTitle>
                  <CardDescription className="text-[10px] leading-normal mt-0.5 line-clamp-2">
                    {s.desc}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
