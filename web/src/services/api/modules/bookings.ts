import { createCrudApi } from './crud';
import { delay, store } from '../mock/store';
import type { Booking } from '@/shared/types';

const crud = createCrudApi<Booking>('bookings');

export const bookingsApi = {
  ...crud,
  async filter(params: {
    customer_email?: string;
    date?: string;
    employee_id?: string;
    status?: string;
  }): Promise<Booking[]> {
    await delay();
    return store.bookings.filter((b) => {
      if (params.customer_email && b.customer_email !== params.customer_email) return false;
      if (params.date && b.date !== params.date) return false;
      if (params.employee_id && b.employee_id !== params.employee_id) return false;
      if (params.status && b.status !== params.status) return false;
      return true;
    });
  },
};
