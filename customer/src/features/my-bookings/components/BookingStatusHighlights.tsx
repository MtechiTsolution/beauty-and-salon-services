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
  { label: string; icon: LucideIcon; className: string; chipClass: string }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'booking-status-tile--pending',
    chipClass: 'booking-status-chip--pending',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CalendarCheck,
    className: 'booking-status-tile--confirmed',
    chipClass: 'booking-status-chip--confirmed',
  },
  completed: {
    label: 'Completed',
    icon: CalendarCheck,
    className: 'booking-status-tile--completed',
    chipClass: 'booking-status-chip--completed',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Ban,
    className: 'booking-status-tile--cancelled',
    chipClass: 'booking-status-chip--cancelled',
  },
  no_show: {
    label: 'No-show',
    icon: UserX,
    className: 'booking-status-tile--no-show',
    chipClass: 'booking-status-chip--no-show',
  },
};

const PAYMENT_STATUS: Record<
  PaymentStatus,
  { label: string; icon: LucideIcon; className: string; chipClass: string }
> = {
  unpaid: {
    label: 'Unpaid',
    icon: CircleDollarSign,
    className: 'booking-status-tile--unpaid',
    chipClass: 'booking-status-chip--unpaid',
  },
  paid: {
    label: 'Paid',
    icon: CreditCard,
    className: 'booking-status-tile--paid',
    chipClass: 'booking-status-chip--paid',
  },
  refunded: {
    label: 'Refunded',
    icon: RotateCcw,
    className: 'booking-status-tile--refunded',
    chipClass: 'booking-status-chip--refunded',
  },
};

type BookingStatusHighlightsProps = {
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  /** Tighter chips for booking grid cards */
  compact?: boolean;
};

function StatusTile({
  title,
  label,
  icon: Icon,
  className,
}: {
  title: string;
  label: string;
  icon: LucideIcon;
  className: string;
}) {
  return (
    <div className={cn('booking-status-tile', className)}>
      <div className="flex items-center gap-2">
        <div className="booking-status-tile-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="booking-status-tile-label text-[11px] font-semibold uppercase tracking-wide opacity-80">
            {title}
          </p>
          <p className="booking-status-tile-value text-sm font-bold leading-tight md:text-base">{label}</p>
        </div>
      </div>
    </div>
  );
}

function StatusChip({
  label,
  icon: Icon,
  className,
}: {
  label: string;
  icon: LucideIcon;
  className: string;
}) {
  return (
    <span className={cn('booking-status-chip', className)}>
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      <span>{label}</span>
    </span>
  );
}

export function BookingStatusHighlights({
  bookingStatus,
  paymentStatus,
  compact = false,
}: BookingStatusHighlightsProps) {
  const booking = BOOKING_STATUS[bookingStatus];
  const payment = PAYMENT_STATUS[paymentStatus];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <StatusChip label={booking.label} icon={booking.icon} className={booking.chipClass} />
        <StatusChip label={payment.label} icon={payment.icon} className={payment.chipClass} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-stretch">
      <StatusTile
        title="Appointment"
        label={booking.label}
        icon={booking.icon}
        className={booking.className}
      />
      <StatusTile
        title="Payment"
        label={payment.label}
        icon={payment.icon}
        className={payment.className}
      />
    </div>
  );
}
