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
import type { Service } from '@mit-salon/shared/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Scissors, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ServiceReviewDialogProps = {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ServiceReviewDialog({ service, open, onOpenChange }: ServiceReviewDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submit = useMutation({
    mutationFn: () =>
      reviewsApi.create({
        customer_email: user!.email,
        customer_name: user!.full_name,
        service_id: service.id,
        rating,
        comment: comment.trim() || undefined,
        status: 'approved',
      }),
    onSuccess: async () => {
      await invalidateAllCatalogQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['my-reviews', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['reviews-landing'] });
      queryClient.invalidateQueries({ queryKey: ['service-reviews'] });
      toast.success('Thank you for reviewing this service!');
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
              <Star className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
              Review this service
            </DialogTitle>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Share your experience to help others choose the right treatment
            </p>
          </div>

          <div className="review-dialog-visit mx-6 rounded-xl border border-border/80 bg-muted/30 px-4 py-3.5">
            <p className="flex items-center gap-2 font-heading text-base font-semibold leading-snug text-foreground">
              <Scissors className="h-4 w-4 shrink-0 text-primary" />
              {service.title}
            </p>
            {service.description ? (
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{service.description}</p>
            ) : null}
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="space-y-3">
              <Label className="block text-center text-sm font-semibold text-foreground">
                How was this service?
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
              <Label htmlFor="service-review-comment" className="text-sm font-medium text-foreground">
                Comments & suggestions{' '}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="service-review-comment"
                rows={4}
                className="review-dialog-textarea min-h-[100px] resize-none rounded-xl border-border/80 bg-background text-sm leading-relaxed"
                placeholder="What did you love about this treatment? Would you recommend it?"
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
