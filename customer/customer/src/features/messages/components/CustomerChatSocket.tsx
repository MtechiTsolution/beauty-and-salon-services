import { useAuth } from '@/features/auth/context/AuthContext';
import { ChatWebSocketProvider } from '@mit-salon/shared/hooks/useChatWebSocket';
import type { ReactNode } from 'react';

export function CustomerChatSocket({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <ChatWebSocketProvider
      role="customer"
      customerEmail={user?.email}
      enabled={Boolean(user?.email)}
    >
      {children}
    </ChatWebSocketProvider>
  );
}
