import { query } from '../db.js';
import { notifyChatChange } from './catalogSync.js';
import { broadcastChatUpdated } from './chatWebSocket.js';
import { newId } from '../utils.js';

export type BookingChatSeed = {
  id: string;
  customer_email: string;
  customer_name: string;
  branch_id: string;
  branch_name: string;
  service_title: string;
  booking_date: string | Date;
  time_slot: string;
};

const SALON_WELCOME =
  'Hello! Thank you for booking with us. Our reception team is here if you have questions about your appointment, timing, or services.';

export async function createChatForBooking(booking: BookingChatSeed): Promise<string> {
  const existing = await query<{ id: string }[]>(
    'SELECT id FROM booking_chats WHERE booking_id = ?',
    [booking.id],
  );
  if (existing[0]) return existing[0].id;

  const chatId = newId();
  await query(
    `INSERT INTO booking_chats (id, booking_id, customer_email, customer_name, branch_id, branch_name)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      chatId,
      booking.id,
      booking.customer_email,
      booking.customer_name,
      booking.branch_id,
      booking.branch_name,
    ],
  );

  const dateLabel = String(booking.booking_date).slice(0, 10);
  const details = `Your booking for ${booking.service_title} on ${dateLabel} at ${booking.time_slot} is confirmed.`;
  await query(
    `INSERT INTO chat_messages (id, chat_id, sender_role, sender_name, body, read_by_customer, read_by_salon)
     VALUES (?, ?, 'salon', ?, ?, 0, 1)`,
    [newId(), chatId, `${booking.branch_name} Reception`, `${SALON_WELCOME}\n\n${details}`],
  );

  notifyChatChange(chatId);
  broadcastChatUpdated(chatId, booking.customer_email);
  return chatId;
}
