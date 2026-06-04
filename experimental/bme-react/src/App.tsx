import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppStateProvider } from './hooks/useAppState';
import { ThemeProvider } from './components/theme-provider';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { ManualTab } from './components/manual/ManualTab';
import { AITab } from './components/ai/AITab';
import { Finance } from './components/finance/Finance';
import { History } from './components/history/History';
import { Settings } from './components/settings/Settings';

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="bme_theme">
      <AppStateProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="manual/:tabId" element={<ManualTab />} />
              <Route path="ai/:tabId" element={<AITab />} />
              <Route path="finance" element={<Finance />} />
              <Route path="finance/:tabId" element={<Finance />} />
              <Route path="history" element={<History />} />
              <Route path="history/:tabId" element={<History />} />
              <Route path="settings" element={<Settings />} />
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppStateProvider>
    </ThemeProvider>
  );
}

export default App;
