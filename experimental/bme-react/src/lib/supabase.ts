import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://qydhvqhkmmrfizawfgvx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5ZGh2cWhrbW1yZml6YXdmZ3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDcwMDgsImV4cCI6MjA5NTEyMzAwOH0.YEtleS0eRXrX15xKHyMWf5uC5AHFOb0_5CALnVt3OAQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: 'implicit',
    persistSession: true,
    detectSessionInUrl: true,
  },
});

const EDGE_VALIDATE_ADMIN = `${SUPABASE_URL}/functions/v1/validate-admin`;
const EDGE_USER_DATA = `${SUPABASE_URL}/functions/v1/user-data-proxy`;

export async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
  if (error) throw new Error(error.message);
}

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function validateAdminServer(accessToken: string) {
  const response = await fetch(EDGE_VALIDATE_ADMIN, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 403) {
    throw new Error('403');
  }

  if (!response.ok) {
    throw new Error(`Validasi admin gagal: ${response.status}`);
  }

  return await response.json(); // { isAdmin: true, user: {...} }
}

export async function loadUserData(accessToken: string) {
  const response = await fetch(EDGE_USER_DATA, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.status === 403) {
    throw new Error('403');
  }

  if (!response.ok) {
    throw new Error(`Gagal memuat data cloud: ${response.status}`);
  }

  const data = await response.json();
  if (!data || Object.keys(data).length === 0) return null;
  return data;
}

export async function loadUserDataSince(accessToken: string, sinceTimestamp: string) {
  const url = sinceTimestamp
    ? `${EDGE_USER_DATA}?since=${encodeURIComponent(sinceTimestamp)}`
    : EDGE_USER_DATA;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.status === 403) {
    throw new Error('403');
  }

  if (!response.ok) {
    throw new Error(`Gagal memuat data cloud: ${response.status}`);
  }

  const data = await response.json();
  if (!data || Object.keys(data).length === 0) return null;
  return data;
}

export async function saveUserData(accessToken: string, data: any) {
  const response = await fetch(EDGE_USER_DATA, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    console.error('[supabase] saveUserData failed:', response.status);
    return false;
  }

  return true;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
