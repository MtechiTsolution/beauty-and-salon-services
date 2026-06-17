import { query } from '../db.js';
import { newId, rowDates } from '../utils.js';

export type ChatSenderRole = 'customer' | 'salon';

export function mapChatMessage(row: Record<string, unknown>) {
  const out = rowDates(row);
  if ('read_by_customer' in out) (out as Record<string, unknown>).read_by_customer = Boolean(out.read_by_customer);
  if ('read_by_salon' in out) (out as Record<string, unknown>).read_by_salon = Boolean(out.read_by_salon);
  return out;
}

export async function getChatCustomerEmail(chatId: string): Promise<string | null> {
  const rows = await query<{ customer_email: string }[]>(
    'SELECT customer_email FROM booking_chats WHERE id = ?',
    [chatId],
  );
  return rows[0]?.customer_email ?? null;
}

export async function chatExists(chatId: string): Promise<boolean> {
  const rows = await query<{ id: string }[]>('SELECT id FROM booking_chats WHERE id = ?', [chatId]);
  return Boolean(rows[0]);
}

export async function insertChatMessage(input: {
  chatId: string;
  body: string;
  senderRole: ChatSenderRole;
  senderName: string;
}) {
  const text = input.body.trim();
  if (!text) throw new Error('Message is required');
  if (!input.senderName.trim()) throw new Error('sender_name is required');

  const id = newId();
  const readByCustomer = input.senderRole === 'customer' ? 1 : 0;
  const readBySalon = input.senderRole === 'salon' ? 1 : 0;

  await query(
    `INSERT INTO chat_messages (id, chat_id, sender_role, sender_name, body, read_by_customer, read_by_salon)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, input.chatId, input.senderRole, input.senderName.trim(), text, readByCustomer, readBySalon],
  );
  await query('UPDATE booking_chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [input.chatId]);

  const rows = await query<Record<string, unknown>[]>('SELECT * FROM chat_messages WHERE id = ?', [id]);
  return mapChatMessage(rows[0]);
}

export async function markChatMessagesRead(chatId: string, audience: ChatSenderRole) {
  if (audience === 'customer') {
    await query(
      `UPDATE chat_messages SET read_by_customer = 1
       WHERE chat_id = ? AND sender_role = 'salon' AND read_by_customer = 0`,
      [chatId],
    );
    return;
  }

  await query(
    `UPDATE chat_messages SET read_by_salon = 1
     WHERE chat_id = ? AND sender_role = 'customer' AND read_by_salon = 0`,
    [chatId],
  );
}
