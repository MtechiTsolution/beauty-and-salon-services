import { useAuth } from '@/features/auth/context/AuthContext';
import { bookingsApi } from '@/services/api';
import { Card, CardContent } from '@/shared/components/ui/card';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { data: bookings = [] } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: () => bookingsApi.filter({ customer_email: user!.email }),
    enabled: !!user?.email,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold mb-8">My bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-muted-foreground">No bookings yet. <Link to="/book" className="text-primary underline">Book now</Link></p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{b.service_title}</h3>
                    <p className="text-sm text-muted-foreground">{b.branch_name} · {b.employee_name}</p>
                    <p className="text-sm mt-2 flex items-center gap-4">
                      <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" />{b.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{b.time_slot}</span>
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <StatusBadge status={b.status} />
                    <p className="font-bold">${b.final_price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
