import { USE_MOCK_API, apiRequest } from '../client';
import { delay, store } from '../mock/store';
import type { User, UserRole } from '../../../types';

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  customer: { email: 'customer@example.com', password: 'password' },
  admin: { email: 'admin@mitsalon.com', password: 'password' },
};

function persistSession(user: User) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('mit_salon_user_id', user.id);
  }
  if (USE_MOCK_API) {
    store.currentUserId = user.id;
  }
}

function clearSession() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('mit_salon_user_id');
  }
  if (USE_MOCK_API) {
    store.currentUserId = null;
  }
}

function restoreSessionLocal() {
  const id =
    typeof localStorage !== 'undefined' ? localStorage.getItem('mit_salon_user_id') : null;
  if (USE_MOCK_API && id && store.users.some((u) => u.id === id)) {
    store.currentUserId = id;
  }
}

async function mockMe(): Promise<User | null> {
  await delay();
  if (!store.currentUserId) return null;
  return store.users.find((u) => u.id === store.currentUserId) ?? null;
}

async function realMe(): Promise<User | null> {
  try {
    return await apiRequest<User | null>('/auth/me');
  } catch {
    return null;
  }
}

async function mockLogin(email: string, _password: string): Promise<User> {
  await delay();
  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error('Invalid email or password');
  persistSession(user);
  return user;
}

async function realLogin(email: string, password: string): Promise<User> {
  const user = await apiRequest<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  persistSession(user);
  return user;
}

async function mockRegister(data: {
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
  persistSession(user);
  return user;
}

async function realRegister(data: {
  email: string;
  full_name: string;
  password: string;
  phone?: string;
}): Promise<User> {
  const user = await apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  persistSession(user);
  return user;
}

async function mockLogout(): Promise<void> {
  await delay();
  clearSession();
}

async function realLogout(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    clearSession();
  }
}

async function mockUpdateProfile(data: { full_name?: string; phone?: string }): Promise<User> {
  await delay();
  const user = store.users.find((u) => u.id === store.currentUserId);
  if (!user) throw new Error('Not signed in');
  if (data.full_name != null) user.full_name = data.full_name;
  if (data.phone !== undefined) user.phone = data.phone || undefined;
  user.updated_at = new Date().toISOString();
  return { ...user };
}

async function realUpdateProfile(data: { full_name?: string; phone?: string }): Promise<User> {
  return apiRequest<User>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

async function loginAsDemo(role: UserRole): Promise<User> {
  const creds = DEMO_CREDENTIALS[role];
  if (USE_MOCK_API) {
    const user = store.users.find((u) => u.role === role);
    if (!user) throw new Error('Demo user not found');
    persistSession(user);
    return user;
  }
  return realLogin(creds.email, creds.password);
}

export const authApi = {
  me: () => (USE_MOCK_API ? mockMe() : realMe()),

  login: (email: string, password: string) =>
    USE_MOCK_API ? mockLogin(email, password) : realLogin(email, password),

  register: (data: { email: string; full_name: string; password: string; phone?: string }) =>
    USE_MOCK_API ? mockRegister(data) : realRegister(data),

  logout: () => (USE_MOCK_API ? mockLogout() : realLogout()),

  updateProfile: (data: { full_name?: string; phone?: string }) =>
    USE_MOCK_API ? mockUpdateProfile(data) : realUpdateProfile(data),

  restoreSession: restoreSessionLocal,

  loginAsDemo,
};

authApi.restoreSession();
