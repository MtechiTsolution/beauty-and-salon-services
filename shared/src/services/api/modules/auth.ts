import { apiRequest } from '../client';
import type { User, UserRole } from '../../../types';

const DEMO_CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  customer: { email: 'customer@example.com', password: 'password' },
  admin: { email: 'admin@mitsalon.com', password: 'password' },
};

function persistSession(user: User) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('mit_salon_user_id', user.id);
  }
}

function clearSession() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('mit_salon_user_id');
  }
}

function restoreSessionLocal() {
  /* Session restored via /auth/me on next request using X-User-Id header. */
}

async function me(): Promise<User | null> {
  try {
    return await apiRequest<User | null>('/auth/me');
  } catch {
    return null;
  }
}

async function login(email: string, password: string): Promise<User> {
  const user = await apiRequest<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  persistSession(user);
  return user;
}

async function register(data: {
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

async function logout(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    clearSession();
  }
}

async function updateProfile(data: { full_name?: string; phone?: string }): Promise<User> {
  return apiRequest<User>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

async function loginAsDemo(role: UserRole): Promise<User> {
  const creds = DEMO_CREDENTIALS[role];
  return login(creds.email, creds.password);
}

export const authApi = {
  me,
  login,
  register,
  logout,
  updateProfile,
  restoreSession: restoreSessionLocal,
  loginAsDemo,
};

authApi.restoreSession();
