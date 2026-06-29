/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SESSION_STORAGE_KEY?: string;
  readonly VITE_ADMIN_APP_URL?: string;
  readonly VITE_SUPER_ADMIN_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
