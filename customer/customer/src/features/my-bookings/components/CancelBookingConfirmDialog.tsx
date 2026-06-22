import { Button } from '@mit-salon/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@mit-salon/shared/components/ui/dialog';
import {
  customerCancelConfirmDescription,
  customerCancelConfirmTitle,
} from '@mit-salon/shared/lib/booking-customer';
import { formatBookingTimeWindow } from '@mit-salon/shared/lib/booking-slots';
import type { Booking } from '@mit-salon/shared/types';
import { CalendarDays, Clock, Loader2, MapPin, XCircle } from 'lucide-react';

type CancelBookingConfirmDialogProps = {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isCancelling?: boolean;
};

export function CancelBookingConfirmDialog({
  booking,
  open,
  onOpenChange,
  onConfirm,
  isCancelling,
}: CancelBookingConfirmDialogProps) {
  if (!booking) return null;

  const timeLabel =
    booking.duration_minutes > 0
      ? formatBookingTimeWindow(booking.time_slot, booking.duration_minutes)
      : booking.time_slot;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="cancel-booking-dialog mit-dialog-content gap-0 overflow-hidden p-0 sm:max-w-[440px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="cancel-booking-dialog-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="cancel-booking-dialog-header px-6 pb-4 pt-6 text-center">
            <div className="cancel-booking-dialog-icon mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <XCircle className="h-6 w-6" aria-hidden />
            </div>
            <DialogTitle className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
              {customerCancelConfirmTitle()}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {customerCancelConfirmDescription(booking)}
            </DialogDescription>
          </div>

          <div className="cancel-booking-dialog-visit mx-6 mb-5 rounded-xl border border-border/80 bg-muted/30 px-4 py-3.5">
            <p className="font-heading text-base font-semibold leading-snug text-foreground">
              {booking.service_title}
            </p>
            <ul className="mt-2.5 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                {booking.branch_name}
              </li>
              <li className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" />
                {booking.date}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
                {timeLabel}
              </li>
            </ul>
          </div>
        </div>

        <div className="cancel-booking-dialog-footer mit-dialog-footer flex shrink-0 flex-col gap-2 border-t border-border/80 bg-card px-6 py-4 sm:flex-row-reverse">
          <Button
            type="button"
            variant="destructive"
            className="h-11 flex-1 rounded-full font-semibold shadow-sm"
            disabled={isCancelling}
            onClick={onConfirm}
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Cancelling…
              </>
            ) : (
              'Yes, cancel booking'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-full"
            disabled={isCancelling}
            onClick={() => onOpenChange(false)}
          >
            Keep booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
