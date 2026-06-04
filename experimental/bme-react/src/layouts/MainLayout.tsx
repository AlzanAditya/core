import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Home,
  FileText,
  Sparkles,
  BarChart3,
  History,
  Settings,
  Eye,
  EyeOff,
  Plus,
  X,
  ChevronRight,
  LogOut,
  LayoutGrid,
  List,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    tabs,
    activeTabId,
    switchTab,
    closeTab,
    createNewTab,
    manualViewMode,
    setManualViewMode,
    updateActiveTabTitle,
    settings,
    updateSettings,
    isLoggedIn,
    adminProfile,
    handleLogout,
    loading,
  } = useAppState();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('bme_sidebar_collapsed') === 'true';
  });

  const [labelsHidden, setLabelsHidden] = useState(() => {
    return localStorage.getItem('bme_labels_hidden') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('bme_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('bme_labels_hidden', String(labelsHidden));
    if (labelsHidden) {
      document.body.classList.add('labels-hidden');
    } else {
      document.body.classList.remove('labels-hidden');
    }
  }, [labelsHidden]);

  // URL → State (single source of truth: URL drives state, never the reverse)
  useEffect(() => {
    if (loading) return;

    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const mode = parts[0];
    const tabId = parts[1];

    if (mode === 'dashboard') {
      if (activeTabId !== 'tab_dashboard') {
        switchTab('tab_dashboard');
      }
    } else if (tabId) {
      const existing = tabs.find(t => t.id === tabId);
      if (existing) {
        if (activeTabId !== tabId) {
          switchTab(tabId);
        }
      } else {
        // Tab not found (e.g. was closed), fall back to dashboard
        navigate('/dashboard', { replace: true });
      }
    }
    // No else: non-dashboard URLs without tabId are handled by the router's
    // <Route path="finance" /> which renders Finance; no state sync needed
  }, [location.pathname, loading]); // eslint-disable-line react-hooks/exhaustive-deps
  // NOTE: intentionally omits tabs/activeTabId/switchTab from deps to prevent
  // a feedback loop. State reads inside are from the current render closure;
  // the effect only needs to re-run when the URL actually changes.

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.mode === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/${tab.mode}/${tab.id}`);
    }
  };

  // Closes a tab and navigates to the correct next URL
  const handleCloseTab = (tabId: string) => {
    const index = tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;
    const remainingTabs = tabs.filter(t => t.id !== tabId);
    closeTab(tabId);
    // Only navigate if we're closing the currently active tab
    if (activeTabId === tabId && remainingTabs.length > 0) {
      const nextIndex = Math.min(index, remainingTabs.length - 1);
      const nextTab = remainingTabs[nextIndex];
      if (nextTab.mode === 'dashboard') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate(`/${nextTab.mode}/${nextTab.id}`, { replace: true });
      }
    }
  };

  const handleCreateNewManualTab = () => {
    const newTab = createNewTab('manual');
    navigate(`/manual/${newTab.id}`);
  };

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'dark':
        return <Moon className="size-4" />;
      case 'light':
        return <Sun className="size-4" />;
      default:
        return <Monitor className="size-4" />;
    }
  };

  const getThemeName = () => {
    switch (settings.theme) {
      case 'dark':
        return 'Gelap';
      case 'light':
        return 'Terang';
      default:
        return 'Sistem';
    }
  };

  const currentTab = tabs.find(t => t.id === activeTabId);
  const showWorkspaceHeader = currentTab && currentTab.mode === 'manual';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans text-foreground">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out shrink-0",
          sidebarCollapsed ? "w-16" : "w-60"
        )}
      >
        {/* Brand logo */}
        <div className={cn("flex h-14 items-center border-b border-border px-4", sidebarCollapsed && "justify-center px-0")}>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_12px_rgba(var(--primary),0.3)]">
              <Sparkles className="size-4 shrink-0" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-sm font-bold tracking-wider uppercase text-primary">bme.studio</span>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1">
            {[
              { label: 'Beranda', mode: 'dashboard', icon: <Home className="size-4" /> },
              { label: 'Manual', mode: 'manual', icon: <FileText className="size-4" /> },
              { label: 'AI Mode', mode: 'ai', icon: <Sparkles className="size-4" /> },
              { label: 'Keuangan', mode: 'finance', icon: <BarChart3 className="size-4" /> },
              { label: 'Histori', mode: 'history', icon: <History className="size-4" /> }
            ].map((item) => {
              const active = currentTab?.mode === item.mode;
              return (
                <li key={item.mode}>
                  <button
                    onClick={() => {
                      if (item.mode === 'dashboard') {
                        navigate('/dashboard');
                      } else {
                        // Find first open tab of this mode or create one
                        const existing = tabs.find(t => t.mode === item.mode);
                        if (existing) {
                          navigate(`/${item.mode}/${existing.id}`);
                        } else {
                          const newTab = createNewTab(item.mode as any);
                          navigate(`/${item.mode}/${newTab.id}`);
                        }
                      }
                    }}
                    className={cn(
                      "flex h-9 w-full items-center gap-3 rounded-md px-3 text-xs font-medium transition-all",
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      sidebarCollapsed && "justify-center px-0"
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom items */}
        <div className="border-t border-border p-3 flex flex-col gap-2">
          <button
            onClick={() => navigate('/settings')}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all",
              sidebarCollapsed && "justify-center px-0"
            )}
          >
            <Settings className="size-4 shrink-0" />
            {!sidebarCollapsed && <span>Pengaturan</span>}
          </button>
          
          <div className={cn("flex items-center gap-2", sidebarCollapsed ? "flex-col justify-center" : "px-1")}>
            <Avatar className="size-7 border border-border shadow-sm shrink-0">
              <AvatarImage src={adminProfile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {isLoggedIn && adminProfile?.full_name ? adminProfile.full_name.charAt(0).toUpperCase() : 'G'}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-xs font-semibold">{isLoggedIn && adminProfile?.full_name ? adminProfile.full_name : 'Guest User'}</p>
                <p className="truncate text-[10px] text-muted-foreground">{isLoggedIn && adminProfile?.email ? adminProfile.email : 'guest@bme.local'}</p>
              </div>
            )}
            {isLoggedIn && !sidebarCollapsed && (
              <Button variant="ghost" size="icon" className="size-7" onClick={handleLogout}>
                <LogOut className="size-3.5 text-muted-foreground hover:text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* MOBILE HEADER */}
        <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4 lg:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded bg-primary text-primary-foreground">
              <Sparkles className="size-3.5 shrink-0" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase">BME</span>
          </div>

          <span className="text-xs font-bold text-foreground capitalize">
            {currentTab?.mode === 'dashboard' ? 'Beranda' : currentTab?.mode || 'App'}
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setLabelsHidden(!labelsHidden)}
              title="Tampilkan / Sembunyikan Label"
            >
              {labelsHidden ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => navigate('/settings')}
            >
              <Settings className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </header>

        {/* CHROME TABS BAR (Desktop only) */}
        <div className="hidden lg:flex h-10 border-b border-border bg-muted/20 items-end px-4 gap-1 select-none shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 mb-1.5 shrink-0 hover:bg-accent"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <ChevronRight className={cn("size-3.5 transition-transform", !sidebarCollapsed && "rotate-180")} />
          </Button>

          <div className="flex-1 flex items-end overflow-x-auto no-scrollbar gap-0.5">
            {tabs.map((tab) => {
              const active = tab.id === activeTabId;
              const isDashboard = tab.mode === 'dashboard';
              return (
                <div
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={cn(
                    "group flex h-8 items-center px-3 text-[11px] font-medium border border-border border-b-0 rounded-t-md cursor-pointer transition-all gap-1.5 shrink-0",
                    active
                      ? "bg-background text-foreground border-b-background z-10"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                  style={{ marginBottom: '-1px' }}
                >
                  <div
                    className={cn(
                      "size-1.5 rounded-full shrink-0",
                      tab.mode === 'manual' && "bg-blue-500",
                      tab.mode === 'ai' && "bg-purple-500",
                      tab.mode === 'finance' && "bg-green-500",
                      tab.mode === 'history' && "bg-orange-500",
                      tab.mode === 'dashboard' && "bg-primary"
                    )}
                  />
                  <span className="max-w-28 truncate">{tab.title}</span>
                  {!isDashboard && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseTab(tab.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:bg-accent rounded-sm p-0.5"
                    >
                      <X className="size-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-6 mb-1.5 shrink-0 hover:bg-accent"
            onClick={handleCreateNewManualTab}
            title="Tambah Tab Manual"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>

        {/* WORKSPACE HEADER (Manual Tab controls) */}
        {showWorkspaceHeader && (
          <div className="hidden lg:flex h-11 items-center justify-between border-b border-border bg-card px-4 shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Judul</span>
              <input
                type="text"
                value={currentTab?.title || ''}
                onChange={(e) => {
                  updateActiveTabTitle(e.target.value);
                }}
                className="bg-transparent border-b border-transparent hover:border-border focus:border-primary text-xs font-semibold focus:outline-none px-1 py-0.5 w-48 text-foreground"
                placeholder="Invoice #001"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {/* Pill 1: View Mode */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 px-2.5 rounded-full">
                    {manualViewMode === 'table' ? <List className="size-3" /> : <LayoutGrid className="size-3" />}
                    <span>{manualViewMode === 'table' ? 'Tabel' : 'Kartu'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                  <DropdownMenuItem onClick={() => setManualViewMode('card')} className="gap-1.5 text-xs">
                    <LayoutGrid className="size-3.5" />
                    <span>Kartu</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setManualViewMode('table')} className="gap-1.5 text-xs">
                    <List className="size-3.5" />
                    <span>Tabel</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Pill 2: Label Mode */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 px-2.5 rounded-full">
                    {labelsHidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    <span>{labelsHidden ? 'Sederhana' : 'Detail'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                  <DropdownMenuItem onClick={() => setLabelsHidden(false)} className="gap-1.5 text-xs">
                    <Eye className="size-3.5" />
                    <span>Detail</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLabelsHidden(true)} className="gap-1.5 text-xs">
                    <EyeOff className="size-3.5" />
                    <span>Sederhana</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Pill 3: Theme */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 px-2.5 rounded-full">
                    {getThemeIcon()}
                    <span>{getThemeName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs">
                  <DropdownMenuItem onClick={() => updateSettings({ theme: 'light' })} className="gap-1.5 text-xs">
                    <Sun className="size-3.5" />
                    <span>Terang</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateSettings({ theme: 'dark' })} className="gap-1.5 text-xs">
                    <Moon className="size-3.5" />
                    <span>Gelap</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateSettings({ theme: 'system' })} className="gap-1.5 text-xs">
                    <Monitor className="size-3.5" />
                    <span>Sistem</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* WORKSPACE BODY WRAPPER */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative bg-muted/10">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0">
            <Outlet />
          </main>
        </div>

        {/* MOBILE NAVIGATION BAR */}
        <nav className="flex h-14 items-center justify-around border-t border-border bg-card px-2 lg:hidden shrink-0">
          {[
            { label: 'Beranda', mode: 'dashboard', icon: <Home className="size-4" />, path: '/dashboard' },
            { label: 'Manual', mode: 'manual', icon: <FileText className="size-4" />, path: '/manual' },
            { label: 'AI', mode: 'ai', icon: <Sparkles className="size-4" />, path: '/ai' },
            { label: 'Keuangan', mode: 'finance', icon: <BarChart3 className="size-4" />, path: '/finance' },
            { label: 'Histori', mode: 'history', icon: <History className="size-4" />, path: '/history' }
          ].map((item) => {
            const active = currentTab?.mode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => {
                  if (item.mode === 'dashboard') {
                    navigate('/dashboard');
                  } else {
                    const existing = tabs.find(t => t.mode === item.mode);
                    if (existing) {
                      navigate(`/${item.mode}/${existing.id}`);
                    } else {
                      const newTab = createNewTab(item.mode as any);
                      navigate(`/${item.mode}/${newTab.id}`);
                    }
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
