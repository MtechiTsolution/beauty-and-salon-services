import { chatsApi } from '../services/api/modules/chats-api';

import { Button } from './ui/button';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

import { Textarea } from './ui/textarea';

import { StatusBadge } from './StatusBadge';

import type { BookingChat, ChatMessage } from '../types';
import { formatBookingAppointmentTime } from '../lib/booking-slots';
import { cn } from '../lib/utils';

import { useOptionalChatWebSocket } from '../hooks/useChatWebSocket';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { format, parseISO } from 'date-fns';

import { Loader2, Send } from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';



type BookingChatPanelProps = {

  chat: BookingChat;

  viewerRole: 'customer' | 'salon';

  senderName: string;

  messagesQueryKey: string[];

  listQueryKey: string[];

  className?: string;

};



function formatMessageTime(iso: string) {

  try {

    return format(parseISO(iso), 'MMM d, h:mm a');

  } catch {

    return iso;

  }

}



export function BookingChatPanel({

  chat,

  viewerRole,

  senderName,

  messagesQueryKey,

  listQueryKey,

  className,

}: BookingChatPanelProps) {

  const queryClient = useQueryClient();

  const chatWs = useOptionalChatWebSocket();

  const [draft, setDraft] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const syncTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    const singleLineHeight = 44;
    const maxHeight = 120;
    const nextHeight = Math.min(maxHeight, Math.max(singleLineHeight, el.scrollHeight));
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };



  const { data: messages = [], isLoading } = useQuery({

    queryKey: messagesQueryKey,

    queryFn: () => chatsApi.listMessages(chat.id),

    refetchInterval: chatWs?.connected ? false : 30_000,

  });



  useEffect(() => {

    chatWs?.subscribe(chat.id);

    return () => chatWs?.unsubscribe(chat.id);

  }, [chat.id, chatWs]);



  useEffect(() => {

    const mark = () => {

      if (chatWs?.connected) {

        chatWs.markRead(chat.id);

      } else {

        void chatsApi.markRead(chat.id, viewerRole);

      }

      queryClient.invalidateQueries({ queryKey: listQueryKey });

    };

    mark();

  }, [chat.id, viewerRole, messages.length, queryClient, listQueryKey, chatWs]);



  useEffect(() => {

    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  }, [messages.length]);

  useEffect(() => {
    syncTextareaHeight();
  }, [draft]);



  const send = useMutation({

    mutationFn: (body: string) =>

      chatsApi.sendMessage(chat.id, {

        body,

        sender_role: viewerRole,

        sender_name: senderName,

      }),

    onSuccess: () => {

      setDraft('');

      queryClient.invalidateQueries({ queryKey: messagesQueryKey });

      queryClient.invalidateQueries({ queryKey: listQueryKey });

    },

    onError: (err: Error) => toast.error(err.message || 'Could not send message'),

  });



  const canSend = draft.trim().length > 0 && !send.isPending;



  const handleSend = () => {

    if (!canSend) return;

    const text = draft.trim();

    if (chatWs?.connected) {

      chatWs.sendMessage(chat.id, text, senderName);

      setDraft('');

      return;

    }

    send.mutate(text);

  };



  return (

    <Card className={cn('flex h-full min-h-0 max-h-full flex-col border-border/80 shadow-md', className)}>

      <CardHeader className="shrink-0 border-b border-border/60 pb-4">

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0 flex-1">

            <CardTitle className="font-heading text-lg">{chat.service_title}</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">

              {chat.booking_date}
              {chat.time_slot
                ? ` · ${formatBookingAppointmentTime({
                    time_slot: chat.time_slot,
                    duration_minutes: chat.duration_minutes,
                  })}`
                : ''}

            </p>

          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">

            {chat.booking_status && <StatusBadge status={chat.booking_status} />}

            {chat.payment_status && <StatusBadge status={chat.payment_status} />}

          </div>

        </div>

      </CardHeader>



      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4">

        <div className="booking-chat-messages min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain rounded-xl border border-border/60 bg-muted/20 p-4">

          {isLoading ? (

            <p className="text-center text-sm text-muted-foreground">Loading messages…</p>

          ) : messages.length === 0 ? (

            <p className="text-center text-sm text-muted-foreground">No messages yet. Say hello!</p>

          ) : (

            messages.map((m: ChatMessage) => {

              const isMine = m.sender_role === viewerRole;

              return (

                <div

                  key={m.id}

                  className={cn('flex', isMine ? 'justify-end' : 'justify-start')}

                >

                  <div

                    className={cn(

                      'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',

                      isMine

                        ? 'rounded-br-md bg-primary text-primary-foreground'

                        : 'rounded-bl-md bg-card border border-border/80',

                    )}

                  >

                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={cn('mt-1.5 text-[10px]', isMine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>

                      {formatMessageTime(m.created_at)}

                    </p>

                  </div>

                </div>

              );

            })

          )}

          <div ref={bottomRef} />

        </div>



        <div className="shrink-0 rounded-2xl border border-border/70 bg-gradient-to-b from-background to-muted/30 p-3 shadow-sm">

          <div className="flex items-end gap-3">

            <Textarea

              ref={textareaRef}
              rows={1}

              className="min-h-[2.75rem] max-h-[7.5rem] flex-1 resize-none overflow-y-hidden rounded-xl border-border/60 bg-background/80 px-4 py-2.5 text-sm leading-5 shadow-inner placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/25"

              placeholder="Type your message…"

              value={draft}

              onChange={(e) => setDraft(e.target.value)}

              onKeyDown={(e) => {

                if (e.key === 'Enter' && !e.shiftKey) {

                  e.preventDefault();

                  handleSend();

                }

              }}

              aria-label="Message text"

            />

            <Button

              type="button"

              size="icon"

              className={cn(

                'mb-0.5 h-11 w-11 shrink-0 rounded-full shadow-md transition-all duration-200',

                canSend

                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg active:scale-95'

                  : 'cursor-not-allowed bg-muted text-muted-foreground shadow-none hover:bg-muted',

              )}

              disabled={!canSend}

              onClick={handleSend}

              aria-label="Send message"

              aria-disabled={!canSend}

            >

              {send.isPending ? (

                <Loader2 className="h-5 w-5 animate-spin" />

              ) : (

                <Send className="h-5 w-5 translate-x-px" aria-hidden />

              )}

            </Button>

          </div>

        </div>

      </CardContent>

    </Card>

  );

}

