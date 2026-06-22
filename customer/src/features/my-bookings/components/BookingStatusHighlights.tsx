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
          <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{title}</p>
          <p className="truncate text-sm font-bold leading-tight md:text-base">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function BookingStatusHighlights({
  bookingStatus,
  paymentStatus,
}: BookingStatusHighlightsProps) {
  const booking = BOOKING_STATUS[bookingStatus];
  const payment = PAYMENT_STATUS[paymentStatus];

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
