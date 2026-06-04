export const QR_CONFIG = {
  SUPABASE_URL: "https://cxtmilenczpjetlnqiwo.supabase.co",
  SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dG1pbGVuY3pwamV0bG5xaXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTEzMTUsImV4cCI6MjA5Mjc4NzMxNX0.OpTsBgQACFzE4ipIuOiTFaf-ldscH_hnTDQdY0U52AY",
  WORKER_URL: "https://qr.zanxa.studio",
  STORAGE_BUCKET: "product-images",
  APP_NAME: "ETS Asset Tracking",
  APP_VERSION: "2.0.0",
} as const

export const QR_PUBLIC_BASE = `${QR_CONFIG.WORKER_URL}/p/`
