export interface InvoiceItem {
  name: string;
  price: number;
  qty: number;
  note: string;
  tipe: string;
  qtyUnit: 'pcs' | 'lot';
  invKeterangan: string;
  sjKeterangan: string;
  isNew?: boolean;
}

export interface UserSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  onboarded: boolean;
  downloadFormats: {
    png: boolean;
    jpeg: boolean;
    pdf: boolean;
  };
  defaultDownloadMethod: 'pdf' | 'png' | 'jpeg';
  downloadAndSave: boolean;
  titleRequired: boolean;
  pdfPageMode: 'single' | 'double' | string;
  monthlyTarget: number;
  fileNameFormat: {
    invoice: string;
    suratJalan: string;
  };
  aiDefaultPrompt: string;
  aiModel: string;
  lastLocalUpdate: string | null;
  supabaseUrl?: string;
}

export interface Template {
  id: number | string;
  name: string;
  items: InvoiceItem[];
  created_at?: string;
  updated_at?: string;
  version?: number;
  deleted_at?: string | null;
}

export interface HistoryEntry {
  id: string;
  user_id?: string;
  title: string;
  date: string;
  items: InvoiceItem[];
  cardMode?: 'simple' | 'advance';
  timestamp: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string | null;
}

export interface Tab {
  id: string;
  mode: 'dashboard' | 'manual' | 'ai' | 'finance' | 'history';
  title: string;
  data: {
    invoiceItems?: InvoiceItem[];
    aiCards?: AICard[];
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
  version?: number;
}

export interface AICard {
  id: string;
  title: string;
  items: InvoiceItem[];
  isCollapsed?: boolean;
}

export interface AdminProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    picture?: string;
  };
  raw_user_meta_data?: {
    full_name?: string;
    avatar_url?: string;
    picture?: string;
  };
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
