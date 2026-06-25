import { clearSessionUserId, setSessionUserId } from '../../../lib/session-storage';
import { apiRequest } from '../client';
import type { User, UserRole, SalonRegistrationRequest } from '../../../types';

export type AuthPortal = 'customer' | 'admin';

const DEMO_CREDENTIALS: Partial<Record<UserRole, { email: string; password: string }>> = {
  customer: { email: 'customer@example.com', password: 'password' },
  admin: { email: 'salon@mitsalon.com', password: 'password' },
  super_admin: { email: 'admin@mitsalon.com', password: 'password' },
};

function persistSession(user: User) {
  setSessionUserId(user.id);
}

function clearSession() {
  clearSessionUserId();
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

async function login(email: string, password: string, portal?: AuthPortal): Promise<User> {
  const user = await apiRequest<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, portal }),
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

async function forgotPassword(
  email: string,
  portal: AuthPortal = 'customer',
): Promise<{ ok: boolean; message: string }> {
  return apiRequest<{ ok: boolean; message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email, portal }),
  });
}

async function verifyPasswordResetOtp(
  email: string,
  otp: string,
  portal: AuthPortal = 'customer',
): Promise<{ ok: boolean; resetToken: string; message: string }> {
  return apiRequest<{ ok: boolean; resetToken: string; message: string }>('/auth/verify-reset-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp, portal }),
  });
}

async function resetPasswordWithToken(
  email: string,
  resetToken: string,
  password: string,
  portal: AuthPortal = 'customer',
): Promise<{ ok: boolean; message: string }> {
  return apiRequest<{ ok: boolean; message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, resetToken, password, portal }),
  });
}

async function requestEmailChange(newEmail: string): Promise<{ ok: boolean; message: string }> {
  return apiRequest<{ ok: boolean; message: string }>('/auth/request-email-change', {
    method: 'POST',
    body: JSON.stringify({ newEmail }),
  });
}

async function verifyEmailChange(
  newEmail: string,
  otp: string,
): Promise<{ ok: boolean; changeToken: string; message: string }> {
  return apiRequest<{ ok: boolean; changeToken: string; message: string }>('/auth/verify-email-change', {
    method: 'POST',
    body: JSON.stringify({ newEmail, otp }),
  });
}

async function confirmEmailChange(
  newEmail: string,
  changeToken: string,
): Promise<{ ok: boolean; user: User; message: string }> {
  return apiRequest<{ ok: boolean; user: User; message: string }>('/auth/confirm-email-change', {
    method: 'POST',
    body: JSON.stringify({ newEmail, changeToken }),
  });
}

async function loginAsDemo(role: UserRole): Promise<User> {
  const creds = DEMO_CREDENTIALS[role];
  if (!creds) throw new Error(`No demo credentials for role: ${role}`);
  const portal: AuthPortal = role === 'customer' ? 'customer' : 'admin';
  return login(creds.email, creds.password, portal);
}

export type SalonRegistrationPayload = {
  email: string;
  registrationToken: string;
  full_name: string;
  phone?: string;
  password: string;
  salon: {
    name: string;
    address: string;
    city?: string;
    phone?: string;
    email?: string;
    description?: string;
    opening_time?: string;
    closing_time?: string;
  };
};

async function sendSalonRegisterOtp(email: string) {
  return apiRequest<{ ok: boolean; message: string }>('/auth/salon-register/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

async function verifySalonRegisterOtp(email: string, otp: string) {
  return apiRequest<{ ok: boolean; registrationToken: string; message: string }>(
    '/auth/salon-register/verify-otp',
    {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    },
  );
}

async function completeSalonRegistration(payload: SalonRegistrationPayload) {
  return apiRequest<{
    ok: boolean;
    message: string;
    request: SalonRegistrationRequest;
  }>('/auth/salon-register/complete', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type SalonRegistrationStatus = {
  status: 'none' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'blocked';
  salon_name?: string;
};

async function getSalonRegistrationStatus(email: string): Promise<SalonRegistrationStatus> {
  return apiRequest<SalonRegistrationStatus>(
    `/auth/salon-registration-status?email=${encodeURIComponent(email.trim())}`,
  );
}

export const authApi = {
  me,
  login,
  register,
  logout,
  updateProfile,
  forgotPassword,
  verifyPasswordResetOtp,
  resetPasswordWithToken,
  requestEmailChange,
  verifyEmailChange,
  confirmEmailChange,
  sendSalonRegisterOtp,
  verifySalonRegisterOtp,
  completeSalonRegistration,
  getSalonRegistrationStatus,
  restoreSession: restoreSessionLocal,
  loginAsDemo,
};

authApi.restoreSession();
