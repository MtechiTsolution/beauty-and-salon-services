import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Clock, MapPin, User, Star, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
};

export default function MyBookings() {
  const [user, setUser] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => { base44.auth.redirectToLogin(); }); }, []);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ customer_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.Booking.update(id, { status: 'cancelled' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-bookings'] }); toast.success('Booking cancelled'); },
  });

  const reviewMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => { setReviewDialog(null); toast.success('Review submitted!'); },
  });

  const submitReview = () => {
    reviewMutation.mutate({
      customer_email: user.email,
      customer_name: user.full_name,
      booking_id: reviewDialog.id,
      service_id: reviewDialog.service_id,
      employee_id: reviewDialog.employee_id,
      branch_id: reviewDialog.branch_id,
      rating: reviewRating,
      comment: reviewComment,
    });
  };

  if (!user) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-bold mb-8">My Bookings</h1>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)}</div>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6">Book your first appointment to get started</p>
            <Button asChild className="rounded-full"><a href="/book">Book Now</a></Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <Card key={booking.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{booking.service_title}</h3>
                      <Badge className={`${statusColors[booking.status]} border-0 capitalize`}>{booking.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{booking.date && format(new Date(booking.date), 'PPP')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{booking.time_slot}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{booking.employee_name}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{booking.branch_name}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">${booking.final_price?.toFixed(2) || booking.price?.toFixed(2)}</span>
                      {booking.discount > 0 && <span className="text-accent ml-2">(-${booking.discount.toFixed(2)} discount)</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <Button size="sm" variant="destructive" onClick={() => cancelMutation.mutate(booking.id)} className="rounded-full gap-1">
                        <X className="w-3.5 h-3.5" /> Cancel
                      </Button>
                    )}
                    {booking.status === 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => { setReviewDialog(booking); setReviewRating(5); setReviewComment(''); }} className="rounded-full gap-1">
                        <Star className="w-3.5 h-3.5" /> Review
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!reviewDialog} onOpenChange={() => setReviewDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Leave a Review</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setReviewRating(n)}>
                  <Star className={`w-8 h-8 ${n <= reviewRating ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
            <Textarea placeholder="Share your experience..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>Cancel</Button>
            <Button onClick={submitReview} disabled={reviewMutation.isPending}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}