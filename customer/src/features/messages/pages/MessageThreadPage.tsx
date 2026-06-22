import { useAuth } from '@/features/auth/context/AuthContext';
import { chatsApi } from '@mit-salon/shared/api';
import { BookingChatPanel } from '@mit-salon/shared/components/BookingChatPanel';
import { Button } from '@mit-salon/shared/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export default function MessageThreadPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['customer-chats', user?.email],
    queryFn: () => chatsApi.listForCustomer(user!.email),
    enabled: !!user?.email,
  });

  const chat = chats.find((c) => c.id === chatId);

  if (isLoading) {
    return (
      <div className="customer-chat-thread flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading chat…</p>
      </div>
    );
  }

  if (!chat || !user) {
    return (
      <div className="customer-page">
        <div className="customer-container-wide py-16 text-center">
          <p className="text-muted-foreground">Chat not found.</p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link to="/messages">Back to messages</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-chat-thread flex h-full min-h-0 flex-col overflow-hidden">
      <div className="customer-container-wide shrink-0 px-4 py-3">
        <Button asChild variant="ghost" size="sm" className="gap-2 rounded-full">
          <Link to="/messages">
            <ArrowLeft className="h-4 w-4" />
            All messages
          </Link>
        </Button>
      </div>
      <div className="customer-container-wide min-h-0 flex-1 px-4 pb-4">
        <BookingChatPanel
          chat={chat}
          viewerRole="customer"
          senderName={user.full_name}
          messagesQueryKey={['chat-messages', chat.id]}
          listQueryKey={['customer-chats', user.email]}
          className="h-full min-h-0"
        />
      </div>
    </div>
  );
}
