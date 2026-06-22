import { useAuth } from '@/features/auth/context/AuthContext';
import { chatsApi } from '@mit-salon/shared/api';
import { Button } from '@mit-salon/shared/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';

/** Opens chat for a booking (creates chat if missing for older bookings). */
export default function BookingChatRedirectPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();

  const { data: chat, isLoading, isError } = useQuery({
    queryKey: ['chat-by-booking', bookingId],
    queryFn: () => chatsApi.getByBooking(bookingId!),
    enabled: !!bookingId && !!user,
  });

  if (isLoading) {
    return (
      <div className="customer-page flex items-center justify-center py-20">
        <p className="text-muted-foreground">Opening chat…</p>
      </div>
    );
  }

  if (isError || !chat) {
    return (
      <div className="customer-page">
        <div className="customer-container-wide py-16 text-center">
          <p className="text-muted-foreground">Could not open chat for this booking.</p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link to="/my-bookings">My bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <Navigate to={`/messages/${chat.id}`} replace />;
}
