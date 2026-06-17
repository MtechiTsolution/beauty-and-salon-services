import { apiRequest } from '../client';
import { createRestCrudApi } from './rest-crud';
import type { Notification } from '../../../types';

const crud = createRestCrudApi<Notification>('notifications');

export type AnnouncementSummary = {
  batch_id: string;
  title: string;
  message: string;
  recipient_count: number;
  sent_at: string;
};

export type SendAnnouncementPayload = {
  title: string;
  message: string;
  audience: 'all' | 'selected';
  emails?: string[];
};

export const notificationsApi = {
  ...crud,
  async listForAdmin(): Promise<Notification[]> {
    return apiRequest<Notification[]>('/notifications?audience=admin');
  },
  async listForUser(userEmail: string): Promise<Notification[]> {
    const q = new URLSearchParams({ user_email: userEmail });
    return apiRequest<Notification[]>(`/notifications?${q.toString()}`);
  },
  async listAnnouncements(): Promise<AnnouncementSummary[]> {
    return apiRequest<AnnouncementSummary[]>('/notifications/announcements');
  },
  async sendAnnouncement(payload: SendAnnouncementPayload): Promise<{
    batch_id: string;
    recipient_count: number;
  }> {
    return apiRequest('/notifications/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async markRead(id: string): Promise<Notification> {
    return apiRequest<Notification>(`/notifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    });
  },
  async markAllRead(userEmail: string): Promise<void> {
    await apiRequest('/notifications/mark-all-read', {
      method: 'POST',
      body: JSON.stringify({ user_email: userEmail }),
    });
  },
};
