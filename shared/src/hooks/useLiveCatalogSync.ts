import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateAllCatalogQueries } from '../lib/catalog-query-keys';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
const POLL_MS = 3000;

function syncEventsUrl() {
  return `${API_BASE.replace(/\/$/, '')}/sync/events`;
}

function syncVersionUrl() {
  return `${API_BASE.replace(/\/$/, '')}/sync/version`;
}

export function useLiveCatalogSync() {
  const queryClient = useQueryClient();
  const lastVersion = useRef<number | null>(null);

  useEffect(() => {
    let disposed = false;
    let es: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const applyChange = async () => {
      if (!disposed) await invalidateAllCatalogQueries(queryClient);
    };

    const onVersionPayload = (payload: { version: number }) => {
      if (lastVersion.current === null) {
        lastVersion.current = payload.version;
        return;
      }
      if (payload.version !== lastVersion.current) {
        lastVersion.current = payload.version;
        void applyChange();
      }
    };

    const startPolling = () => {
      if (pollTimer) return;
      pollTimer = setInterval(async () => {
        if (disposed) return;
        try {
          const res = await fetch(syncVersionUrl());
          if (!res.ok) return;
          onVersionPayload((await res.json()) as { version: number });
        } catch { /* offline */ }
      }, POLL_MS);
    };

    try {
      es = new EventSource(syncEventsUrl());
      es.onmessage = (event) => {
        try {
          onVersionPayload(JSON.parse(event.data) as { version: number });
        } catch {
          void applyChange();
        }
      };
      es.onerror = () => {
        es?.close();
        es = null;
        startPolling();
      };
    } catch {
      startPolling();
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void applyChange();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      es?.close();
      if (pollTimer) clearInterval(pollTimer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [queryClient]);
}
