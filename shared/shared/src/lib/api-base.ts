/** Default `/api` matches Vite dev proxy → backend on port 3001. */
export function getApiBase(): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api';
  return base.replace(/\/$/, '');
}
