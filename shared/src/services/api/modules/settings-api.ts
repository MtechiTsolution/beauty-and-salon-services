import { apiRequest } from '../client';
import type { SmtpSettingsInput, SmtpSettingsPublic } from '../../../types/smtp-settings';

export const settingsApi = {
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
