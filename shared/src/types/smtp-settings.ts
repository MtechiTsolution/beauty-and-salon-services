export type SmtpScope = 'salon' | 'platform';

export type SmtpSettingsPublic = {
  scope: SmtpScope;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  from: string;
  app_name: string;
  password_set: boolean;
  configured: boolean;
  source: 'database' | 'environment' | 'none';
  updated_at?: string;
  /** Populated on settings GET for authorized admins only. */
  password?: string;
};

export type SmtpSettingsInput = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password?: string;
  from?: string;
  app_name?: string;
};
