const DEFAULT_SESSION_KEY = 'mit_salon_user_id';

export function getSessionStorageKey(): string {
  const envKey = import.meta.env.VITE_SESSION_STORAGE_KEY;
  return typeof envKey === 'string' && envKey.trim() ? envKey.trim() : DEFAULT_SESSION_KEY;
}

export function getSessionUserId(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(getSessionStorageKey());
}

export function setSessionUserId(userId: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(getSessionStorageKey(), userId);
}

export function clearSessionUserId(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(getSessionStorageKey());
}
