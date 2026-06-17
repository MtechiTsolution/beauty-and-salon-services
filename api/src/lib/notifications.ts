import { query } from '../db.js';
import { newId } from '../utils.js';

export type NotificationType = 'booking' | 'payment' | 'reminder' | 'system' | 'announcement';

type CreateNotificationInput = {
  title: string;
  message: string;
  type: NotificationType;
  user_email?: string | null;
  reference_id?: string | null;
};

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  const id = newId();
  await query(
    `INSERT INTO notifications (id, user_email, title, message, type, \`read\`, reference_id)
     VALUES (?, ?, ?, ?, ?, 0, ?)`,
    [
      id,
      input.user_email?.trim() || null,
      input.title,
      input.message,
      input.type,
      input.reference_id ?? null,
    ],
  );
}

export type BookingNotificationRow = {
  id: string;
  customer_email: string;
  customer_name: string;
  service_title: string;
  branch_name: string;
  booking_date: string;
  time_slot: string;
  status: string;
  payment_status: string;
  payment_method?: string | null;
};

function formatBookingDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function bookingSummary(b: BookingNotificationRow): string {
  return `${b.service_title} at ${b.branch_name} on ${formatBookingDate(b.booking_date)} at ${b.time_slot}`;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'pending approval',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'marked as no-show',
};

export async function notifyBookingCreated(booking: BookingNotificationRow): Promise<void> {
  const summary = bookingSummary(booking);

  await createNotification({
    title: 'New booking request',
    message: `${booking.customer_name} (${booking.customer_email}) requested ${summary}.`,
    type: 'booking',
    reference_id: booking.id,
  });

  await createNotification({
    title: 'Booking submitted',
    message: `Your appointment for ${summary} is ${STATUS_LABELS.pending}.`,
    type: 'booking',
    user_email: booking.customer_email,
    reference_id: booking.id,
  });
}

export async function notifyBookingStatusChange(
  booking: BookingNotificationRow,
  previousStatus: string,
): Promise<void> {
  if (booking.status === previousStatus) return;

  const summary = bookingSummary(booking);
  const statusLabel = STATUS_LABELS[booking.status] ?? booking.status;

  await createNotification({
    title: 'Booking status updated',
    message: `${booking.customer_name}'s booking for ${summary} is now ${statusLabel}.`,
    type: 'booking',
    reference_id: booking.id,
  });

  const customerTitles: Record<string, string> = {
    confirmed: 'Booking confirmed',
    completed: 'Appointment completed',
    cancelled: 'Booking cancelled',
    no_show: 'Appointment missed',
  };
  const customerTitle = customerTitles[booking.status];
  if (!customerTitle) return;

  const customerMessages: Record<string, string> = {
    confirmed: `Your appointment for ${summary} has been confirmed.`,
    completed: `Your appointment for ${summary} is complete. Thank you for visiting us!`,
    cancelled: `Your appointment for ${summary} has been cancelled.`,
    no_show: `You were marked as a no-show for ${summary}. Please contact the salon if this is incorrect.`,
  };

  await createNotification({
    title: customerTitle,
    message: customerMessages[booking.status] ?? `Your booking status is now ${statusLabel}.`,
    type: 'booking',
    user_email: booking.customer_email,
    reference_id: booking.id,
  });
}

export async function notifyBookingPaymentChange(
  booking: BookingNotificationRow,
  previousPaymentStatus: string,
): Promise<void> {
  if (booking.payment_status === previousPaymentStatus) return;

  const summary = bookingSummary(booking);

  if (booking.payment_status === 'paid') {
    const method = booking.payment_method ? ` via ${booking.payment_method}` : '';
    await createNotification({
      title: 'Payment received',
      message: `Payment${method} received for ${booking.customer_name}'s booking (${summary}).`,
      type: 'payment',
      reference_id: booking.id,
    });
    await createNotification({
      title: 'Payment confirmed',
      message: `Your payment${method} for ${summary} has been recorded.`,
      type: 'payment',
      user_email: booking.customer_email,
      reference_id: booking.id,
    });
    return;
  }

  if (booking.payment_status === 'refunded') {
    await createNotification({
      title: 'Payment refunded',
      message: `A refund was issued for ${booking.customer_name}'s booking (${summary}).`,
      type: 'payment',
      reference_id: booking.id,
    });
    await createNotification({
      title: 'Payment refunded',
      message: `Your payment for ${summary} has been refunded.`,
      type: 'payment',
      user_email: booking.customer_email,
      reference_id: booking.id,
    });
  }
}

export type AnnouncementAudience = 'all' | 'selected';

export type SendAnnouncementInput = {
  title: string;
  message: string;
  audience: AnnouncementAudience;
  emails?: string[];
};

export type AnnouncementSummary = {
  batch_id: string;
  title: string;
  message: string;
  recipient_count: number;
  sent_at: string;
};

export async function sendAnnouncement(
  input: SendAnnouncementInput,
): Promise<{ batch_id: string; recipient_count: number }> {
  const title = input.title.trim();
  const message = input.message.trim();
  if (!title) throw new Error('Title is required');
  if (!message) throw new Error('Message is required');

  let emails: string[] = [];
  if (input.audience === 'all') {
    const rows = await query<{ email: string }[]>(
      `SELECT email FROM users WHERE role = 'customer'`,
    );
    emails = rows.map((r) => r.email.trim()).filter(Boolean);
  } else {
    emails = [...new Set((input.emails ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean))];
    if (emails.length > 0) {
      const placeholders = emails.map(() => '?').join(', ');
      const valid = await query<{ email: string }[]>(
        `SELECT email FROM users WHERE role = 'customer' AND LOWER(email) IN (${placeholders})`,
        emails,
      );
      emails = valid.map((r) => r.email);
    }
  }

  if (emails.length === 0) {
    throw new Error('No customer recipients found');
  }

  const batchId = newId();
  for (const email of emails) {
    await createNotification({
      title,
      message,
      type: 'announcement',
      user_email: email,
      reference_id: batchId,
    });
  }

  return { batch_id: batchId, recipient_count: emails.length };
}

export async function listAnnouncements(): Promise<AnnouncementSummary[]> {
  const rows = await query<Record<string, unknown>[]>(
    `SELECT reference_id AS batch_id, title, message,
            COUNT(*) AS recipient_count, MIN(created_at) AS sent_at
     FROM notifications
     WHERE type = 'announcement' AND reference_id IS NOT NULL
     GROUP BY reference_id, title, message
     ORDER BY sent_at DESC
     LIMIT 100`,
  );

  return rows.map((row) => ({
    batch_id: String(row.batch_id),
    title: String(row.title),
    message: String(row.message),
    recipient_count: Number(row.recipient_count ?? 0),
    sent_at: row.sent_at instanceof Date ? row.sent_at.toISOString() : String(row.sent_at),
  }));
}
