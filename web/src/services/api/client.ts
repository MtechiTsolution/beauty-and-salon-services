const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

/** When true, all modules use in-memory mock store instead of HTTP */
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';
