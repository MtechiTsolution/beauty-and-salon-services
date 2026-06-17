import { getApiBase } from '../../lib/api-base';

const API_BASE = getApiBase();

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
    const text = await res.text();
    let message = res.statusText || 'Request failed';
    try {
      const err = JSON.parse(text) as { message?: string };
      if (err.message) message = err.message;
    } catch {
      if (text.includes('Cannot POST') || text.includes('Cannot GET')) {
        message = 'API endpoint not found — restart the backend server and try again.';
      }
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
