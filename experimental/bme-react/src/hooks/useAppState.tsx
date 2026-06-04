import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { InvoiceItem, UserSettings, Template, HistoryEntry, Tab, AdminProfile, SyncStatus } from '../types';
import * as dbHelpers from '../lib/db';
import * as supabaseHelpers from '../lib/supabase';

interface AppStateContextProps {
  currentMode: 'dashboard' | 'manual' | 'ai' | 'finance' | 'history';
  manualViewMode: 'card' | 'table';
  manualCardMode: 'simple' | 'advance';
  settings: UserSettings;
  history: HistoryEntry[];
  templates: Template[];
  tabs: Tab[];
  activeTabId: string;
  isLoggedIn: boolean;
  adminProfile: AdminProfile | null;
  syncStatus: SyncStatus;
  loading: boolean;
  
  // Setters
  setManualViewMode: (mode: 'card' | 'table') => void;
  setManualCardMode: (mode: 'simple' | 'advance') => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  
  // Tab Management
  createNewTab: (mode: 'dashboard' | 'manual' | 'ai' | 'finance' | 'history', title?: string | null, data?: any) => Tab;
  switchTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  updateActiveTabTitle: (title: string) => void;
  updateActiveTabData: (data: any) => void;
  getActiveTab: () => Tab | undefined;
  
  // History & Templates
  addToHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp' | 'created_at' | 'updated_at' | 'version'>) => Promise<void>;
  updateHistoryTitle: (id: string, newTitle: string) => Promise<void>;
  updateHistoryEntry: (id: string, updates: Partial<HistoryEntry>) => Promise<void>;
  removeFromHistory: (id: string) => Promise<void>;
  removeMultipleFromHistory: (ids: string[]) => Promise<void>;
  addTemplate: (name: string, items: InvoiceItem[]) => Promise<void>;
  removeTemplate: (id: string | number) => Promise<void>;
  reorderTemplates: (reordered: Template[]) => Promise<void>;
  
  // Auth & Cloud Sync
  login: (session: any, profile: AdminProfile) => void;
  handleLogout: () => Promise<void>;
  triggerCloudSync: () => Promise<void>;
}

const DEFAULTS: { settings: UserSettings; templates: Template[] } = {
  settings: {
    language: 'id',
    theme: 'light',
    onboarded: false,
    downloadFormats: { png: true, jpeg: true, pdf: true },
    defaultDownloadMethod: 'pdf',
    downloadAndSave: false,
    titleRequired: true,
    pdfPageMode: 'single',
    monthlyTarget: 3800000,
    fileNameFormat: {
      invoice: 'Invoice-{judul}',
      suratJalan: 'Surat Jalan-{judul}',
    },
    aiDefaultPrompt: 'Ekstrak data faktur/invoice dari teks mentah berikut. Format harus terstruktur dengan membagi data menjadi satu atau beberapa judul invoice. Untuk setiap judul, kelompokkan item ke dalam list. Setiap item harus memiliki field: name (nama barang/jasa, default "..." jika kosong), tipe (pilih salah satu dari: "-", "ICA", "Protecta", "Prolink", "APC"), qtyUnit (unit kuantitas: "pcs" atau "lot", default "pcs"), qty (kuantitas integer, default 1), price (harga integer satuan, default 0), dan note (catatan tambahan, default "..." jika kosong).',
    aiModel: 'gemini-3.5-flash',
    lastLocalUpdate: null,
  },
  templates: [
    {
      id: 1,
      name: "Instalasi Listrik Rumah",
      items: [
        { name: "Kabel NYM 3x2.5", price: 150000, qty: 10, note: "Eterna", tipe: "Prolink", qtyUnit: "pcs", invKeterangan: "", sjKeterangan: "" },
        { name: "MCB Schneider 16A", price: 85000, qty: 5, note: "", tipe: "Prolink", qtyUnit: "pcs", invKeterangan: "", sjKeterangan: "" },
        { name: "Stop Kontak Panasonic", price: 25000, qty: 8, note: "Tempel", tipe: "Prolink", qtyUnit: "pcs", invKeterangan: "", sjKeterangan: "" },
      ],
    },
  ],
};

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState<'dashboard' | 'manual' | 'ai' | 'finance' | 'history'>('dashboard');
  const [manualViewMode, setManualViewModeState] = useState<'card' | 'table'>('card');
  const [manualCardMode, setManualCardModeState] = useState<'simple' | 'advance'>('simple');
  const [settings, setSettings] = useState<UserSettings>(DEFAULTS.settings);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  // Prevent multiple parallel DB sync chains
  const mirrorPromise = useRef<Promise<any>>(Promise.resolve());

  // Load state on mount
  useEffect(() => {
    async function initDB() {
      try {
        // Run migration first
        await dbHelpers.migrateFromLocalStorage();

        // Load preferences from localStorage (fast sync reads)
        const cachedSettings = localStorage.getItem('bme_settings');
        if (cachedSettings) {
          try {
            const parsed = JSON.parse(cachedSettings);
            setSettings({
              ...DEFAULTS.settings,
              ...parsed,
              downloadFormats: { ...DEFAULTS.settings.downloadFormats, ...(parsed.downloadFormats || {}) },
              fileNameFormat: { ...DEFAULTS.settings.fileNameFormat, ...(parsed.fileNameFormat || {}) },
            });
          } catch (e) {
            console.error('Error parsing settings:', e);
          }
        }

        const cachedViewMode = localStorage.getItem('bme_manual_view_mode') as 'card' | 'table';
        if (cachedViewMode) setManualViewModeState(cachedViewMode);

        const cachedCardMode = localStorage.getItem('bme_manual_card_mode') as 'simple' | 'advance';
        if (cachedCardMode) setManualCardModeState(cachedCardMode);

        const cachedIsLoggedIn = localStorage.getItem('bme_is_logged_in') === 'true';
        setIsLoggedIn(cachedIsLoggedIn);

        const cachedProfile = localStorage.getItem('bme_admin_profile');
        if (cachedProfile) {
          try {
            setAdminProfile(JSON.parse(cachedProfile));
          } catch (e) {}
        }

        const userId = cachedIsLoggedIn && cachedProfile ? JSON.parse(cachedProfile).id : 'guest';

        // Load from IndexedDB
        const localHistory = await dbHelpers.getAll('history', userId);
        const localTemplates = await dbHelpers.getAll('templates', userId);
        const localTabs = await dbHelpers.getAll('tabs', userId);

        setHistory(localHistory as HistoryEntry[]);
        setTemplates(localTemplates.length > 0 ? (localTemplates as Template[]) : DEFAULTS.templates);

        // Process Tabs
        let finalTabs: Tab[] = localTabs as Tab[];
        let activeId = localStorage.getItem('bme_active_tab_id') || '';

        // Ensure dashboard tab always exists at index 0
        const dashboardIdx = finalTabs.findIndex(t => t.mode === 'dashboard');
        if (dashboardIdx === -1) {
          const dbTab: Tab = {
            id: 'tab_dashboard',
            mode: 'dashboard',
            title: 'Beranda',
            data: {},
          };
          finalTabs.unshift(dbTab);
          await dbHelpers.putRecord('tabs', dbTab);
        } else if (dashboardIdx > 0) {
          const [dbTab] = finalTabs.splice(dashboardIdx, 1);
          finalTabs.unshift(dbTab);
        }

        // If tabs only contain dashboard, create initial manual tab too
        if (finalTabs.length === 1) {
          const initialTab: Tab = {
            id: 'tab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
            mode: 'manual',
            title: 'Invoice #001',
            data: { invoiceItems: [] },
          };
          finalTabs.push(initialTab);
          await dbHelpers.putRecord('tabs', initialTab);
        }

        // Default active tab to dashboard if none found
        if (!activeId || !finalTabs.some(t => t.id === activeId)) {
          activeId = 'tab_dashboard';
        }

        setTabs(finalTabs);
        setActiveTabId(activeId);
        
        const activeTab = finalTabs.find(t => t.id === activeId);
        if (activeTab) {
          setCurrentMode(activeTab.mode);
        }

        // Load active session from Supabase client
        const session = await supabaseHelpers.getSession();
        if (session) {
          try {
            const serverProfile = await supabaseHelpers.validateAdminServer(session.access_token);
            setIsLoggedIn(true);
            setAdminProfile(serverProfile.user || session.user);
            localStorage.setItem('bme_is_logged_in', 'true');
            localStorage.setItem('bme_admin_profile', JSON.stringify(serverProfile.user || session.user));
          } catch (e) {
            console.error('Supabase session validate failed:', e);
          }
        }
      } catch (err) {
        console.error('Error initializing App State:', err);
      } finally {
        setLoading(false);
      }
    }

    initDB();
  }, []);

  // Sync state to localStorage on changes
  const setManualViewMode = (mode: 'card' | 'table') => {
    setManualViewModeState(mode);
    localStorage.setItem('bme_manual_view_mode', mode);
  };

  const setManualCardMode = (mode: 'simple' | 'advance') => {
    setManualCardModeState(mode);
    localStorage.setItem('bme_manual_card_mode', mode);
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('bme_settings', JSON.stringify(updated));
      return updated;
    });
    updateLocalTimestamp();
  };

  const resetSettings = () => {
    setSettings(DEFAULTS.settings);
    localStorage.setItem('bme_settings', JSON.stringify(DEFAULTS.settings));
    updateLocalTimestamp();
  };

  const updateLocalTimestamp = () => {
    const now = new Date().toISOString();
    setSettings(prev => {
      const updated = { ...prev, lastLocalUpdate: now };
      localStorage.setItem('bme_settings', JSON.stringify(updated));
      return updated;
    });
    enqueueSync();
  };

  // Enqueue a sync operation
  const enqueueSync = async () => {
    if (!isLoggedIn) return;
    setSyncStatus('syncing');
    try {
      await mirrorPromise.current;
      const userId = adminProfile?.id || 'guest';
      
      // Mirror tabs, history, and templates to IndexedDB
      mirrorPromise.current = (async () => {
        await dbHelpers.replaceAllForUser('tabs', userId, tabs);
        await dbHelpers.replaceAllForUser('history', userId, history);
        await dbHelpers.replaceAllForUser('templates', userId, templates);
      })();
      await mirrorPromise.current;
      
      // Enqueue sync operation
      await dbHelpers.enqueueSyncOp('tabs', 'UPDATE', 'full_state', {
        timestamp: new Date().toISOString()
      });
      
      // Trigger actual sync
      await triggerCloudSync();
    } catch (e) {
      console.error('[StateManager] Enqueue sync failed:', e);
      setSyncStatus('error');
    }
  };

  const triggerCloudSync = async () => {
    if (!isLoggedIn) return;
    setSyncStatus('syncing');
    try {
      const session = await supabaseHelpers.getSession();
      if (!session) {
        setSyncStatus('error');
        return;
      }

      const dataToSync = {
        settings,
        history,
        templates,
        tabs,
      };

      const success = await supabaseHelpers.saveUserData(session.access_token, dataToSync);
      if (success) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      console.error('[StateManager] Cloud sync failed:', e);
      setSyncStatus('error');
    }
  };

  // Tab Management
  const getActiveTab = () => {
    return tabs.find(t => t.id === activeTabId);
  };

  const createNewTab = (mode: 'dashboard' | 'manual' | 'ai' | 'finance' | 'history', title?: string | null, data?: any) => {
    const id = 'tab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    if (!title) {
      const count = tabs.filter(t => t.mode === mode).length + 1;
      const modeNames = {
        dashboard: 'Beranda',
        manual: 'Manual',
        ai: 'AI Mode',
        finance: 'Keuangan',
        history: 'Histori',
      };
      title = mode === 'dashboard' ? 'Beranda' : `${modeNames[mode] || 'Tab'} ${count}`;
    }
    if (!data) {
      data = mode === 'manual' ? { invoiceItems: [] } : {};
    }
    
    const newTab: Tab = { id, mode, title, data };
    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    setActiveTabId(id);
    setCurrentMode(mode);

    localStorage.setItem('bme_active_tab_id', id);
    
    // Save to local DB as well
    const userId = isLoggedIn && adminProfile ? adminProfile.id : 'guest';
    dbHelpers.putRecord('tabs', { ...newTab, user_id: userId });

    return newTab;
  };

  const switchTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);
      setCurrentMode(tab.mode);
      localStorage.setItem('bme_active_tab_id', tabId);
    }
  };

  const closeTab = (tabId: string) => {
    const index = tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    if (tabs.length === 1) {
      alert("Gagal menutup tab. Harus ada minimal satu tab aktif.");
      return;
    }

    const updatedTabs = tabs.filter(t => t.id !== tabId);
    setTabs(updatedTabs);

    let nextActiveId = activeTabId;
    if (activeTabId === tabId) {
      const nextActiveIndex = Math.min(index, updatedTabs.length - 1);
      nextActiveId = updatedTabs[nextActiveIndex].id;
      setActiveTabId(nextActiveId);
      setCurrentMode(updatedTabs[nextActiveIndex].mode);
    }

    localStorage.setItem('bme_active_tab_id', nextActiveId);
    
    // Hard delete tab from IndexedDB
    dbHelpers.hardDelete('tabs', tabId);
  };

  const updateActiveTabTitle = (title: string) => {
    setTabs(prev => {
      const updated = prev.map(t => (t.id === activeTabId ? { ...t, title } : t));
      const active = updated.find(t => t.id === activeTabId);
      if (active) {
        const userId = isLoggedIn && adminProfile ? adminProfile.id : 'guest';
        dbHelpers.putRecord('tabs', { ...active, user_id: userId });
      }
      return updated;
    });
  };

  const updateActiveTabData = (data: any) => {
    setTabs(prev => {
      const updated = prev.map(t => (t.id === activeTabId ? { ...t, data: { ...t.data, ...data } } : t));
      const active = updated.find(t => t.id === activeTabId);
      if (active) {
        const userId = isLoggedIn && adminProfile ? adminProfile.id : 'guest';
        dbHelpers.putRecord('tabs', { ...active, user_id: userId });
      }
      return updated;
    });
  };

  // History & Templates
  const addToHistory = async (entry: Omit<HistoryEntry, 'id' | 'timestamp' | 'created_at' | 'updated_at' | 'version'>) => {
    const userId = isLoggedIn && adminProfile ? adminProfile.id : 'guest';
    const now = new Date().toISOString();
    const newEntry: HistoryEntry = {
      ...entry,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      user_id: userId,
      timestamp: now,
      created_at: now,
      updated_at: now,
      version: 1,
    };

    setHistory(prev => [newEntry, ...prev]);
    await dbHelpers.putRecord('history', newEntry);
    updateLocalTimestamp();
  };

  const updateHistoryTitle = async (id: string, newTitle: string) => {
    setHistory(prev => prev.map(h => h.id === id ? { ...h, title: newTitle, updated_at: new Date().toISOString() } : h));
    const entry = await dbHelpers.getById('history', id);
    if (entry) {
      await dbHelpers.putRecord('history', { ...entry, title: newTitle });
    }
    updateLocalTimestamp();
  };

  const updateHistoryEntry = async (id: string, updates: Partial<HistoryEntry>) => {
    setHistory(prev => prev.map(h => h.id === id ? { ...h, ...updates, updated_at: new Date().toISOString() } : h));
    const entry = await dbHelpers.getById('history', id);
    if (entry) {
      await dbHelpers.putRecord('history', { ...entry, ...updates });
    }
    updateLocalTimestamp();
  };

  const removeFromHistory = async (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    await dbHelpers.softDelete('history', id);
    updateLocalTimestamp();
  };

  const removeMultipleFromHistory = async (ids: string[]) => {
    setHistory(prev => prev.filter(h => !ids.includes(h.id)));
    for (const id of ids) {
      await dbHelpers.softDelete('history', id);
    }
    updateLocalTimestamp();
  };

  const addTemplate = async (name: string, items: InvoiceItem[]) => {
    const userId = isLoggedIn && adminProfile ? adminProfile.id : 'guest';
    const now = new Date().toISOString();
    const newTemplate: Template = {
      id: `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name,
      items,
      created_at: now,
      updated_at: now,
      version: 1,
      deleted_at: null,
    };

    setTemplates(prev => [...prev, newTemplate]);
    await dbHelpers.putRecord('templates', { ...newTemplate, user_id: userId });
    updateLocalTimestamp();
  };

  const removeTemplate = async (id: string | number) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    await dbHelpers.softDelete('templates', String(id));
    updateLocalTimestamp();
  };

  const reorderTemplates = async (reordered: Template[]) => {
    setTemplates(reordered);
    const userId = isLoggedIn && adminProfile ? adminProfile.id : 'guest';
    await dbHelpers.replaceAllForUser('templates', userId, reordered);
    updateLocalTimestamp();
  };

  const login = (_session: any, profile: AdminProfile) => {
    setIsLoggedIn(true);
    setAdminProfile(profile);
    localStorage.setItem('bme_is_logged_in', 'true');
    localStorage.setItem('bme_admin_profile', JSON.stringify(profile));
    
    // Reload data for this user
    dbHelpers.getAll('history', profile.id).then(h => setHistory(h as HistoryEntry[]));
    dbHelpers.getAll('templates', profile.id).then(t => setTemplates(t.length > 0 ? (t as Template[]) : DEFAULTS.templates));
    dbHelpers.getAll('tabs', profile.id).then(t => {
      const tabsList = t as Tab[];
      if (tabsList.length > 0) {
        setTabs(tabsList);
        const active = tabsList.find(tab => tab.id === activeTabId) || tabsList[0];
        setActiveTabId(active.id);
        setCurrentMode(active.mode);
      }
    });
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    setAdminProfile(null);
    setSyncStatus('idle');
    localStorage.setItem('bme_is_logged_in', 'false');
    localStorage.removeItem('bme_admin_profile');
    
    await dbHelpers.clearAccountData();
    await supabaseHelpers.logout();

    // Reset to local defaults
    setHistory([]);
    setTemplates(DEFAULTS.templates);
    const initialTabs: Tab[] = [
      { id: 'tab_dashboard', mode: 'dashboard', title: 'Beranda', data: {} },
      { id: 'tab_' + Date.now(), mode: 'manual', title: 'Invoice #001', data: { invoiceItems: [] } }
    ];
    setTabs(initialTabs);
    setActiveTabId('tab_dashboard');
    setCurrentMode('dashboard');
  };

  return (
    <AppStateContext.Provider value={{
      currentMode,
      manualViewMode,
      manualCardMode,
      settings,
      history,
      templates,
      tabs,
      activeTabId,
      isLoggedIn,
      adminProfile,
      syncStatus,
      loading,
      
      setManualViewMode,
      setManualCardMode,
      updateSettings,
      resetSettings,
      
      createNewTab,
      switchTab,
      closeTab,
      updateActiveTabTitle,
      updateActiveTabData,
      getActiveTab,
      
      addToHistory,
      updateHistoryTitle,
      updateHistoryEntry,
      removeFromHistory,
      removeMultipleFromHistory,
      addTemplate,
      removeTemplate,
      reorderTemplates,
      
      login,
      handleLogout,
      triggerCloudSync
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
