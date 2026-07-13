import { apiRequest } from '../client';
import type { SmtpSettingsInput, SmtpSettingsPublic } from '../../../types/smtp-settings';
import type { AppCurrencyCode, AppCurrencySettings } from '../../../lib/currency';

export type CurrencyConvertResult = {
  amount: number;
  from: AppCurrencyCode;
  to: AppCurrencyCode;
  rate: number;
  converted: number;
  rates_as_of: string | null;
  provider: string;
};

export const settingsApi = {
  getCurrency() {
    return apiRequest<AppCurrencySettings>('/settings/currency');
  },
  updateCurrency(input: { currency?: AppCurrencyCode; base_currency?: AppCurrencyCode }) {
    return apiRequest<AppCurrencySettings>('/settings/currency', {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  convertCurrency(amount: number, from: AppCurrencyCode, to: AppCurrencyCode) {
    const q = new URLSearchParams({
      amount: String(amount),
      from,
      to,
    });
    return apiRequest<CurrencyConvertResult>(`/settings/currency/convert?${q.toString()}`);
  },
  getSalonSmtp() {
    return apiRequest<SmtpSettingsPublic>('/settings/smtp');
  },
  updateSalonSmtp(input: SmtpSettingsInput) {
    return apiRequest<SmtpSettingsPublic>('/settings/smtp', {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  testSalonSmtp(testEmail: string) {
    return apiRequest<{ ok: true; message: string }>('/settings/smtp/test', {
      method: 'POST',
      body: JSON.stringify({ test_email: testEmail }),
    });
  },
};
