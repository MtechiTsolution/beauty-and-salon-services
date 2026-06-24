import { useAuth } from '@/features/auth/context/AuthContext';
import { reviewsApi } from '@mit-salon/shared/api';
import { StarRatingPicker } from '@mit-salon/shared/components/StarRating';
import { Button } from '@mit-salon/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mit-salon/shared/components/ui/dialog';
import { Label } from '@mit-salon/shared/components/ui/label';
import { Textarea } from '@mit-salon/shared/components/ui/textarea';
import { invalidateAllCatalogQueries } from '@mit-salon/shared/lib/catalog-query-keys';
import { formatBookingAppointmentTime } from '@mit-salon/shared/lib/booking-slots';
import type { Booking } from '@mit-salon/shared/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, MapPin, Sparkles, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type BookingReviewDialogProps = {
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BookingReviewDialog({ booking, open, onOpenChange }: BookingReviewDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submit = useMutation({
    mutationFn: () =>
      reviewsApi.create({
        customer_email: user!.email,
        customer_name: user!.full_name,
        booking_id: booking.id,
        service_id: booking.service_id,
        employee_id: booking.employee_id,
        branch_id: booking.branch_id,
        rating,
        comment: comment.trim() || undefined,
        status: 'approved',
      }),
    onSuccess: async () => {
      await invalidateAllCatalogQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['my-reviews', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings', user?.email] });
      toast.success('Thank you for your review!');
      onOpenChange(false);
      setComment('');
      setRating(0);
    },
    onError: (err: Error) => toast.error(err.message || 'Could not submit review'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="review-dialog mit-dialog-content gap-0 overflow-hidden p-0 sm:max-w-[440px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="review-dialog-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="review-dialog-header px-6 pb-4 pt-6 text-center">
            <div className="review-dialog-icon mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
              Rate your visit
            </DialogTitle>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your feedback helps us improve every appointment
            </p>
          </div>

          <div className="review-dialog-visit mx-6 rounded-xl border border-border/80 bg-muted/30 px-4 py-3.5">
            <p className="font-heading text-base font-semibold leading-snug text-foreground">
              {booking.service_title}
            </p>
            <ul className="mt-2.5 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                {booking.branch_name}
              </li>
              <li className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 shrink-0 text-primary" />
                {booking.employee_name}
              </li>
              <li className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" />
                {booking.date} · {formatBookingAppointmentTime(booking)}
              </li>
            </ul>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="space-y-3">
              <Label className="block text-center text-sm font-semibold text-foreground">
                How was your experience?
              </Label>
              <StarRatingPicker
                value={rating}
                onChange={setRating}
                size="lg"
                showLabel
                className="review-dialog-stars"
              />
            </div>

            <div className="space-y-2 pb-1">
              <Label htmlFor="review-comment" className="text-sm font-medium text-foreground">
                Comments & suggestions{' '}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="review-comment"
                rows={4}
                className="review-dialog-textarea min-h-[100px] resize-none rounded-xl border-border/80 bg-background text-sm leading-relaxed"
                placeholder="Tell us about your experience, what you loved, or any suggestions to improve our service…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="review-dialog-footer mit-dialog-footer flex shrink-0 flex-col gap-2 border-t border-border/80 bg-card px-6 py-4 sm:flex-row-reverse">
          <Button
            type="button"
            className="h-11 flex-1 rounded-full font-semibold shadow-sm"
            disabled={submit.isPending || rating < 1}
            onClick={() => submit.mutate()}
          >
            {submit.isPending ? 'Submitting…' : 'Submit review'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
