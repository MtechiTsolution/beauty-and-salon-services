import { useAuth } from '@/features/auth/context/AuthContext';
import { chatsApi } from '@mit-salon/shared/api';
import { StatusBadge } from '@mit-salon/shared/components/StatusBadge';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { formatBookingAppointmentTime } from '@mit-salon/shared/lib/booking-slots';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MessagesPage() {
  const { user } = useAuth();

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['customer-chats', user?.email],
    queryFn: () => chatsApi.listForCustomer(user!.email),
    enabled: !!user?.email,
  });

  return (
    <div className="customer-page">
      <div className="customer-container-wide py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-bold md:text-4xl">Salon messages</h1>
          <p className="mt-2 text-muted-foreground">
            Chat with your salon reception about appointments you have booked.
          </p>
        </div>

        {isLoading ? (
          <p className="mx-auto mt-10 max-w-3xl text-center text-muted-foreground">Loading conversations…</p>
        ) : chats.length === 0 ? (
          <Card className="mx-auto mt-10 max-w-lg border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg text-muted-foreground">No chats yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                A conversation opens automatically when you complete a booking.
              </p>
              <Button asChild className="mt-6 rounded-full" size="lg">
                <Link to="/book">Book an appointment</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {chats.map((chat) => (
              <Link key={chat.id} to={`/messages/${chat.id}`} className="block">
                <Card className="customer-card-hover border-0 shadow-md transition hover:shadow-lg">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div className="min-w-0 text-left">
                      <p className="font-heading font-semibold">{chat.service_title}</p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {chat.booking_date}
                        {chat.time_slot
                          ? ` · ${formatBookingAppointmentTime({
                              time_slot: chat.time_slot,
                              duration_minutes: chat.duration_minutes,
                            })}`
                          : ''}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {chat.booking_status && <StatusBadge status={chat.booking_status} />}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {(chat.unread_customer ?? 0) > 0 && (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground">
                          {chat.unread_customer}
                        </span>
                      )}
                      <span className="text-xs font-medium text-primary">Open chat</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
