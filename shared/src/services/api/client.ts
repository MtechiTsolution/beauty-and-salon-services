import { getApiBase } from '../../lib/api-base';
import { getSessionUserId } from '../../lib/session-storage';

const API_BASE = getApiBase();

function authHeaders(): Record<string, string> {
  const userId = getSessionUserId();
  return userId ? { 'X-User-Id': userId } : {};
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const res = await fetch(url, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
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
