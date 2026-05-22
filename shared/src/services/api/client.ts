const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

function authHeaders(): Record<string, string> {
  if (typeof localStorage === 'undefined') return {};
  const userId = localStorage.getItem('mit_salon_user_id');
  return userId ? { 'X-User-Id': userId } : {};
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers as Record<string, string>),
    },
  });
  if (res.status === 204) return undefined as T;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}
