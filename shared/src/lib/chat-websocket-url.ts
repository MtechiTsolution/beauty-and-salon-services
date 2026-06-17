import { getApiBase } from './api-base';

/** WebSocket URL for live chat (proxied via Vite in dev). */
export function getChatWebSocketUrl(): string {
  const apiBase = getApiBase();
  if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
    const url = new URL(apiBase);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${url.origin}${url.pathname}/chats/ws`.replace(/\/$/, '');
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const base = apiBase.startsWith('/') ? apiBase : `/${apiBase}`;
  return `${protocol}//${window.location.host}${base}/chats/ws`;
}
