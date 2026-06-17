import { chatsApi } from '../services/api/modules/chats-api';

import { Button } from './ui/button';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

import { Textarea } from './ui/textarea';

import { StatusBadge } from './StatusBadge';

import type { BookingChat, ChatMessage } from '../types';

import { cn } from '../lib/utils';

import { useOptionalChatWebSocket } from '../hooks/useChatWebSocket';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { format, parseISO } from 'date-fns';

import { Loader2, Send, Wifi, WifiOff } from 'lucide-react';

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

    <Card className={cn('flex h-full min-h-[28rem] flex-col border-border/80 shadow-md', className)}>

      <CardHeader className="shrink-0 border-b border-border/60 pb-4">

        <div className="flex items-start justify-between gap-3">

          <CardTitle className="font-heading text-lg">{chat.branch_name}</CardTitle>

          {chatWs && (

            <span

              className={cn(

                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',

                chatWs.connected

                  ? 'bg-emerald-500/10 text-emerald-700'

                  : 'bg-muted text-muted-foreground',

              )}

              title={chatWs.connected ? 'Live chat connected' : 'Reconnecting…'}

            >

              {chatWs.connected ? (

                <Wifi className="h-3 w-3" aria-hidden />

              ) : (

                <WifiOff className="h-3 w-3" aria-hidden />

              )}

              {chatWs.connected ? 'Live' : 'Offline'}

            </span>

          )}

        </div>

        <p className="text-sm text-muted-foreground">

          {chat.service_title} · {chat.booking_date} at {chat.time_slot}

        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">

          <span className="text-muted-foreground">{chat.customer_name}</span>

          {chat.booking_status && <StatusBadge status={chat.booking_status} />}

          {chat.payment_status && <StatusBadge status={chat.payment_status} />}

        </div>

        <p className="mt-1 text-xs text-muted-foreground">

          Chat with salon reception — ask about your appointment, timing, or services.

        </p>

      </CardHeader>



      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4">

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 p-4">

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

                    <p className={cn('mb-1 text-xs font-semibold', isMine ? 'text-primary-foreground/90' : 'text-muted-foreground')}>

                      {m.sender_name}

                    </p>

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

              rows={2}

              className="min-h-[3.25rem] flex-1 resize-none rounded-xl border-border/60 bg-background/80 px-4 py-3 text-sm shadow-inner placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/25"

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

          <p className="mt-2 px-1 text-[11px] text-muted-foreground">

            Press <kbd className="rounded border border-border/80 bg-muted/50 px-1 py-0.5 font-sans text-[10px]">Enter</kbd>{' '}

            to send ·{' '}

            <kbd className="rounded border border-border/80 bg-muted/50 px-1 py-0.5 font-sans text-[10px]">Shift</kbd>+

            <kbd className="rounded border border-border/80 bg-muted/50 px-1 py-0.5 font-sans text-[10px]">Enter</kbd>{' '}

            for a new line

          </p>

        </div>

      </CardContent>

    </Card>

  );

}

