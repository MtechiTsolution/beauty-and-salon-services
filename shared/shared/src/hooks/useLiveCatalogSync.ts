import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getApiBase } from '../lib/api-base';
import {
  invalidateAllCatalogQueries,
  refetchActiveCatalogQueries,
  refetchChatQueries,
} from '../lib/catalog-query-keys';

const POLL_MS = 2000;
const CHAT_POLL_MS = 1500;

type SyncPayload = {
  version: number;
  chatVersion?: number;
  at?: number;
  scope?: 'catalog' | 'chat';
  chatId?: string;
};

function syncEventsUrl() {
  return `${getApiBase()}/sync/events`;
}

function syncVersionUrl() {
  return `${getApiBase()}/sync/version`;
}

export function useLiveCatalogSync() {
  const queryClient = useQueryClient();
  const lastCatalogVersion = useRef<number | null>(null);
  const lastChatVersion = useRef<number | null>(null);

  useEffect(() => {
    let disposed = false;
    let es: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const applyCatalogChange = async () => {
      if (disposed) return;
      await invalidateAllCatalogQueries(queryClient);
      await refetchActiveCatalogQueries(queryClient);
    };

    const applyChatChange = async (chatId?: string) => {
      if (disposed) return;
      await refetchChatQueries(queryClient, chatId);
    };

    const onSyncPayload = (payload: SyncPayload) => {
      if (payload.scope === 'chat') {
        if (lastChatVersion.current === null) {
          lastChatVersion.current = payload.version;
          return;
        }
        if (payload.version !== lastChatVersion.current) {
          lastChatVersion.current = payload.version;
          void applyChatChange(payload.chatId);
        }
        return;
      }

      if (lastCatalogVersion.current === null) {
        lastCatalogVersion.current = payload.version;
        if (payload.chatVersion != null) {
          lastChatVersion.current = payload.chatVersion;
        }
        return;
      }
      if (payload.version !== lastCatalogVersion.current) {
        lastCatalogVersion.current = payload.version;
        void applyCatalogChange();
      }
      if (
        payload.chatVersion != null &&
        lastChatVersion.current !== null &&
        payload.chatVersion !== lastChatVersion.current
      ) {
        lastChatVersion.current = payload.chatVersion;
        void applyChatChange();
      }
    };

    const pollVersion = async () => {
      if (disposed) return;
      try {
        const res = await fetch(syncVersionUrl());
        if (!res.ok) return;
        const body = (await res.json()) as SyncPayload;
        onSyncPayload({ ...body, scope: 'catalog' });
        if (body.chatVersion != null) {
          onSyncPayload({
            version: body.chatVersion,
            scope: 'chat',
          });
        }
      } catch {
        /* backend offline */
      }
    };

    const startPolling = () => {
      if (pollTimer) return;
      void pollVersion();
      pollTimer = setInterval(() => void pollVersion(), POLL_MS);
    };

    try {
      es = new EventSource(syncEventsUrl());
      es.onmessage = (event) => {
        try {
          onSyncPayload(JSON.parse(event.data) as SyncPayload);
        } catch {
          void applyCatalogChange();
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

    startPolling();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void applyCatalogChange();
        void applyChatChange();
      }
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

/** Faster chat-only polling fallback for open conversation panels. */
export function useLiveChatSync(chatId: string, enabled = true) {
  const queryClient = useQueryClient();
  const lastChatVersion = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !chatId) return;

    let disposed = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      if (disposed) return;
      try {
        const res = await fetch(syncVersionUrl());
        if (!res.ok) return;
        const body = (await res.json()) as { chatVersion?: number };
        if (body.chatVersion == null) return;
        if (lastChatVersion.current === null) {
          lastChatVersion.current = body.chatVersion;
          return;
        }
        if (body.chatVersion !== lastChatVersion.current) {
          lastChatVersion.current = body.chatVersion;
          await refetchChatQueries(queryClient, chatId);
        }
      } catch {
        /* offline */
      }
    };

    void poll();
    timer = setInterval(() => void poll(), CHAT_POLL_MS);

    return () => {
      disposed = true;
      if (timer) clearInterval(timer);
    };
  }, [chatId, enabled, queryClient]);
}
