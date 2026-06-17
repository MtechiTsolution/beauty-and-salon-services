import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { query } from '../db.js';
import { createChatForBooking } from '../lib/booking-chat.js';
import {
  chatExists,
  getChatCustomerEmail,
  insertChatMessage,
  mapChatMessage,
  markChatMessagesRead,
} from '../lib/chatService.js';
import {
  broadcastChatMessage,
  broadcastChatRead,
  broadcastChatUpdated,
} from '../lib/chatWebSocket.js';
import { rowDates } from '../utils.js';

async function mapChatRow(row: Record<string, unknown>) {
  const chat = rowDates(row) as Record<string, unknown>;
  if (row.booking_date) chat.booking_date = String(row.booking_date).slice(0, 10);
  const unread = await query<{ n: number }[]>(
    `SELECT COUNT(*) AS n FROM chat_messages
     WHERE chat_id = ? AND read_by_salon = 0 AND sender_role = 'customer'`,
    [row.id],
  );
  const unreadCustomer = await query<{ n: number }[]>(
    `SELECT COUNT(*) AS n FROM chat_messages
     WHERE chat_id = ? AND read_by_customer = 0 AND sender_role = 'salon'`,
    [row.id],
  );
  chat.unread_salon = Number(unread[0]?.n ?? 0);
  chat.unread_customer = Number(unreadCustomer[0]?.n ?? 0);
  return chat;
}

const CHAT_LIST_SQL = `
  SELECT c.*,
    b.service_title, b.booking_date, b.time_slot, b.status AS booking_status,
    b.payment_status, b.final_price
  FROM booking_chats c
  JOIN bookings b ON b.id = c.booking_id
`;

export const chatsRouter = Router();

chatsRouter.get(
  '/by-booking/:bookingId',
  asyncHandler(async (req, res) => {
    const rows = await query<Record<string, unknown>[]>(
      `${CHAT_LIST_SQL} WHERE c.booking_id = ?`,
      [req.params.bookingId],
    );
    if (rows[0]) {
      return res.json(await mapChatRow(rows[0]));
    }

    const bookings = await query<Record<string, unknown>[]>(
      'SELECT * FROM bookings WHERE id = ?',
      [req.params.bookingId],
    );
    if (!bookings[0]) return res.status(404).json({ message: 'Booking not found' });

    const b = bookings[0];
    const chatId = await createChatForBooking({
      id: String(b.id),
      customer_email: String(b.customer_email),
      customer_name: String(b.customer_name),
      branch_id: String(b.branch_id),
      branch_name: String(b.branch_name),
      service_title: String(b.service_title),
      booking_date: b.booking_date as string | Date,
      time_slot: String(b.time_slot),
    });

    const created = await query<Record<string, unknown>[]>(
      `${CHAT_LIST_SQL} WHERE c.booking_id = ?`,
      [req.params.bookingId],
    );
    const customerEmail = String(b.customer_email);
    broadcastChatUpdated(chatId, customerEmail);
    res.status(201).json(await mapChatRow(created[0]));
  }),
);

chatsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const customerEmail =
      typeof req.query.customer_email === 'string' ? req.query.customer_email.trim() : '';
    const branchId = typeof req.query.branch_id === 'string' ? req.query.branch_id.trim() : '';

    let sql = `${CHAT_LIST_SQL} WHERE 1=1`;
    const params: unknown[] = [];

    if (customerEmail) {
      sql += ' AND LOWER(c.customer_email) = LOWER(?)';
      params.push(customerEmail);
    }
    if (branchId) {
      sql += ' AND c.branch_id = ?';
      params.push(branchId);
    }

    sql += ' ORDER BY c.updated_at DESC';
    const rows = await query<Record<string, unknown>[]>(sql, params);
    const mapped = await Promise.all(rows.map(mapChatRow));
    res.json(mapped);
  }),
);

chatsRouter.get(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    const rows = await query<Record<string, unknown>[]>(
      'SELECT * FROM chat_messages WHERE chat_id = ? ORDER BY created_at ASC',
      [req.params.id],
    );
    res.json(rows.map(mapChatMessage));
  }),
);

chatsRouter.post(
  '/:id/messages',
  asyncHandler(async (req, res) => {
    const { body, sender_role: senderRole, sender_name: senderName } = req.body as {
      body?: string;
      sender_role?: 'customer' | 'salon';
      sender_name?: string;
    };

    const text = body?.trim();
    if (!text) return res.status(400).json({ message: 'Message is required' });
    if (senderRole !== 'customer' && senderRole !== 'salon') {
      return res.status(400).json({ message: 'sender_role must be customer or salon' });
    }
    const name = senderName?.trim();
    if (!name) return res.status(400).json({ message: 'sender_name is required' });

    const chatId = String(req.params.id);
    if (!(await chatExists(chatId))) return res.status(404).json({ message: 'Chat not found' });

    const message = await insertChatMessage({
      chatId,
      body: text,
      senderRole,
      senderName: name,
    });

    const customerEmail = await getChatCustomerEmail(chatId);
    if (customerEmail) {
      broadcastChatMessage(chatId, customerEmail, message);
      broadcastChatUpdated(chatId, customerEmail);
    }

    res.status(201).json(message);
  }),
);

chatsRouter.post(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const { audience } = req.body as { audience?: 'customer' | 'salon' };
    if (audience !== 'customer' && audience !== 'salon') {
      return res.status(400).json({ message: 'audience must be customer or salon' });
    }

    const chatId = String(req.params.id);
    if (!(await chatExists(chatId))) return res.status(404).json({ message: 'Chat not found' });

    await markChatMessagesRead(chatId, audience);

    const customerEmail = await getChatCustomerEmail(chatId);
    if (customerEmail) {
      broadcastChatRead(chatId, customerEmail, audience);
      broadcastChatUpdated(chatId, customerEmail);
    }

    res.json({ ok: true });
  }),
);
