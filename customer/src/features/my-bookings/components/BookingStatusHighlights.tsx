import type { BookingStatus, PaymentStatus } from '@mit-salon/shared/types';
import { cn } from '@mit-salon/shared/lib/utils';
import {
  Ban,
  CalendarCheck,
  CircleDollarSign,
  Clock,
  CreditCard,
  RotateCcw,
  UserX,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const BOOKING_STATUS: Record<
  BookingStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  pending: {
    label: 'Pending approval',
    icon: Clock,
    className: 'booking-status-tile--pending',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CalendarCheck,
    className: 'booking-status-tile--confirmed',
  },
  completed: {
    label: 'Completed',
    icon: CalendarCheck,
    className: 'booking-status-tile--completed',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Ban,
    className: 'booking-status-tile--cancelled',
  },
  no_show: {
    label: 'No-show',
    icon: UserX,
    className: 'booking-status-tile--no-show',
  },
};

const PAYMENT_STATUS: Record<
  PaymentStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  unpaid: {
    label: 'Unpaid',
    icon: CircleDollarSign,
    className: 'booking-status-tile--unpaid',
  },
  paid: {
    label: 'Paid',
    icon: CreditCard,
    className: 'booking-status-tile--paid',
  },
  refunded: {
    label: 'Refunded',
    icon: RotateCcw,
    className: 'booking-status-tile--refunded',
  },
};

type BookingStatusHighlightsProps = {
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  /** Tighter vertical tiles for booking grid cards */
  compact?: boolean;
};

function StatusTile({
  title,
  label,
  icon: Icon,
  className,
  compact,
}: {
  title: string;
  label: string;
  icon: LucideIcon;
  className: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className={cn('booking-status-tile booking-status-tile--compact', className)}>
        <div className="booking-status-tile-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="booking-status-tile-compact-label">{title}</p>
        <p className="booking-status-tile-compact-value">{label}</p>
      </div>
    );
  }

  return (
    <div className={cn('booking-status-tile', className)}>
      <div className="flex items-center gap-2">
        <div className="booking-status-tile-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="booking-status-tile-label text-[11px] font-semibold uppercase tracking-wide opacity-80">{title}</p>
          <p className="booking-status-tile-value text-sm font-bold leading-tight md:text-base">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function BookingStatusHighlights({
  bookingStatus,
  paymentStatus,
  compact = false,
}: BookingStatusHighlightsProps) {
  const booking = BOOKING_STATUS[bookingStatus];
  const payment = PAYMENT_STATUS[paymentStatus];

  return (
    <div
      className={cn(
        'grid gap-3',
        compact ? 'grid-cols-2 items-stretch' : 'grid-cols-1 sm:grid-cols-2 sm:items-stretch',
      )}
    >
      <StatusTile
        title="Appointment"
        label={booking.label}
        icon={booking.icon}
        className={booking.className}
        compact={compact}
      />
      <StatusTile
        title="Payment"
        label={payment.label}
        icon={payment.icon}
        className={payment.className}
        compact={compact}
      />
    </div>
  );
}
