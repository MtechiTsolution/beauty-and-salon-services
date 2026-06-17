import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatMessage } from '../types';
import { getChatWebSocketUrl } from '../lib/chat-websocket-url';
import { refetchChatQueries } from '../lib/catalog-query-keys';
import { toast } from 'sonner';

type ChatAudience = 'customer' | 'salon';

type WsServerMessage =
  | { type: 'connected' }
  | { type: 'message'; chatId: string; message: ChatMessage }
  | { type: 'read'; chatId: string; audience: ChatAudience }
  | { type: 'chat_updated'; chatId: string; customerEmail: string }
  | { type: 'error'; message: string };

type ChatWebSocketContextValue = {
  connected: boolean;
  subscribe: (chatId: string) => void;
  unsubscribe: (chatId: string) => void;
  sendMessage: (chatId: string, body: string, senderName: string) => void;
  markRead: (chatId: string) => void;
};

const ChatWebSocketContext = createContext<ChatWebSocketContextValue | null>(null);

type ChatWebSocketProviderProps = {
  children: ReactNode;
  role: ChatAudience;
  customerEmail?: string | null;
  enabled?: boolean;
};

const RECONNECT_MS = 3000;

function appendMessage(
  queryClient: ReturnType<typeof useQueryClient>,
  chatId: string,
  message: ChatMessage,
) {
  queryClient.setQueryData<ChatMessage[]>(['chat-messages', chatId], (current) => {
    if (!current?.length) return [message];
    if (current.some((m) => m.id === message.id)) return current;
    return [...current, message];
  });
}

export function ChatWebSocketProvider({
  children,
  role,
  customerEmail,
  enabled = true,
}: ChatWebSocketProviderProps) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscribedChats = useRef<Set<string>>(new Set());
  const disposed = useRef(false);

  const sendWs = useCallback((payload: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }, []);

  const subscribe = useCallback(
    (chatId: string) => {
      subscribedChats.current.add(chatId);
      sendWs({ type: 'subscribe', chatId });
    },
    [sendWs],
  );

  const unsubscribe = useCallback((chatId: string) => {
    subscribedChats.current.delete(chatId);
  }, []);

  const sendMessage = useCallback(
    (chatId: string, body: string, senderName: string) => {
      sendWs({ type: 'send', chatId, body, sender_name: senderName });
    },
    [sendWs],
  );

  const markRead = useCallback(
    (chatId: string) => {
      sendWs({ type: 'read', chatId });
    },
    [sendWs],
  );

  const handleServerMessage = useCallback(
    (payload: WsServerMessage) => {
      if (payload.type === 'connected') {
        setConnected(true);
        for (const chatId of subscribedChats.current) {
          sendWs({ type: 'subscribe', chatId });
        }
        return;
      }

      if (payload.type === 'error') {
        toast.error(payload.message);
        return;
      }

      if (payload.type === 'message') {
        appendMessage(queryClient, payload.chatId, payload.message);
        void refetchChatQueries(queryClient);
        return;
      }

      if (payload.type === 'read' || payload.type === 'chat_updated') {
        void refetchChatQueries(queryClient, payload.chatId);
      }
    },
    [queryClient, sendWs],
  );

  useEffect(() => {
    if (!enabled) {
      setConnected(false);
      return;
    }
    if (role === 'customer' && !customerEmail?.trim()) {
      setConnected(false);
      return;
    }

    disposed.current = false;

    const connect = () => {
      if (disposed.current) return;

      const ws = new WebSocket(getChatWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'auth',
            role,
            email: role === 'customer' ? customerEmail?.trim() : undefined,
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          handleServerMessage(JSON.parse(event.data as string) as WsServerMessage);
        } catch {
          /* ignore malformed payloads */
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        if (!disposed.current) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_MS);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      disposed.current = true;
      setConnected(false);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, role, customerEmail, handleServerMessage]);

  const value = useMemo(
    () => ({ connected, subscribe, unsubscribe, sendMessage, markRead }),
    [connected, subscribe, unsubscribe, sendMessage, markRead],
  );

  return (
    <ChatWebSocketContext.Provider value={value}>{children}</ChatWebSocketContext.Provider>
  );
}

export function useChatWebSocket() {
  const ctx = useContext(ChatWebSocketContext);
  if (!ctx) {
    throw new Error('useChatWebSocket must be used within ChatWebSocketProvider');
  }
  return ctx;
}

/** Optional hook when provider may be absent (e.g. storybook). */
export function useOptionalChatWebSocket() {
  return useContext(ChatWebSocketContext);
}
