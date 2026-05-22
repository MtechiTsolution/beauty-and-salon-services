import { delay, store } from '../mock/store';
import type { User, UserRole } from '@/shared/types';

export const authApi = {
  async me(): Promise<User | null> {
    await delay();
    if (!store.currentUserId) return null;
    return store.users.find((u) => u.id === store.currentUserId) ?? null;
  },

  async login(email: string, _password: string): Promise<User> {
    await delay();
    const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Invalid email or password');
    store.currentUserId = user.id;
    localStorage.setItem('mit_salon_user_id', user.id);
    return user;
  },

  async register(data: {
    email: string;
    full_name: string;
    password: string;
    phone?: string;
  }): Promise<User> {
    await delay();
    if (store.users.some((u) => u.email === data.email)) {
      throw new Error('Email already registered');
    }
    const user: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.users.push(user);
    store.currentUserId = user.id;
    localStorage.setItem('mit_salon_user_id', user.id);
    return user;
  },

  async logout(): Promise<void> {
    await delay();
    store.currentUserId = null;
    localStorage.removeItem('mit_salon_user_id');
  },

  restoreSession(): void {
    const id = localStorage.getItem('mit_salon_user_id');
    if (id && store.users.some((u) => u.id === id)) {
      store.currentUserId = id;
    }
  },

  async loginAsDemo(role: UserRole): Promise<User> {
    const user = store.users.find((u) => u.role === role);
    if (!user) throw new Error('Demo user not found');
    store.currentUserId = user.id;
    localStorage.setItem('mit_salon_user_id', user.id);
    return user;
  },
};

authApi.restoreSession();
