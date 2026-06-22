import { apiRequest } from '../client';
import { branchQuery, type SalonScopeParams } from '../../../lib/salon-scope';
import type { BookingChat, ChatMessage } from '../../../types';

export const chatsApi = {
  async listForCustomer(customerEmail: string): Promise<BookingChat[]> {
    const q = new URLSearchParams({ customer_email: customerEmail });
    return apiRequest<BookingChat[]>(`/chats?${q.toString()}`);
  },

  async listForAdmin(params?: SalonScopeParams): Promise<BookingChat[]> {
    return apiRequest<BookingChat[]>(`/chats${branchQuery(params?.branch_id)}`);
  },

  async getByBooking(bookingId: string): Promise<BookingChat> {
    return apiRequest<BookingChat>(`/chats/by-booking/${bookingId}`);
  },

  async listMessages(chatId: string): Promise<ChatMessage[]> {
    return apiRequest<ChatMessage[]>(`/chats/${chatId}/messages`);
  },

  async sendMessage(
    chatId: string,
    payload: { body: string; sender_role: 'customer' | 'salon'; sender_name: string },
  ): Promise<ChatMessage> {
    return apiRequest<ChatMessage>(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async markRead(chatId: string, audience: 'customer' | 'salon'): Promise<void> {
    await apiRequest(`/chats/${chatId}/read`, {
      method: 'POST',
      body: JSON.stringify({ audience }),
    });
  },
};
