export const APP_CURRENCY_CODES = [
  'USD',
  'EUR',
  'GBP',
  'PKR',
  'INR',
  'AED',
  'SAR',
  'CAD',
  'AUD',
] as const;

export type AppCurrencyCode = (typeof APP_CURRENCY_CODES)[number];

export const DEFAULT_APP_CURRENCY: AppCurrencyCode = 'USD';

export type CurrencyOption = {
  code: AppCurrencyCode;
  label: string;
  symbol: string;
};

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'PKR', label: 'Pakistani Rupee', symbol: 'Rs' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'AED' },
  { code: 'SAR', label: 'Saudi Riyal', symbol: 'SAR' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
];

const CURRENCY_LOCALES: Record<AppCurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'en-IE',
  GBP: 'en-GB',
  PKR: 'en-PK',
  INR: 'en-IN',
  AED: 'en-AE',
  SAR: 'en-SA',
  CAD: 'en-CA',
  AUD: 'en-AU',
};

export type AppCurrencySettings = {
  currency: AppCurrencyCode;
  base_currency: AppCurrencyCode;
  rate: number;
  rates_as_of: string | null;
  provider: string;
};

export function isAppCurrencyCode(value: unknown): value is AppCurrencyCode {
  return typeof value === 'string' && (APP_CURRENCY_CODES as readonly string[]).includes(value);
}

export function normalizeAppCurrency(value: unknown): AppCurrencyCode {
  if (typeof value !== 'string') return DEFAULT_APP_CURRENCY;
  const code = value.trim().toUpperCase();
  return isAppCurrencyCode(code) ? code : DEFAULT_APP_CURRENCY;
}

export function normalizeCurrencySettings(
  input: Partial<AppCurrencySettings> | null | undefined,
): AppCurrencySettings {
  const currency = normalizeAppCurrency(input?.currency);
  const base_currency = normalizeAppCurrency(input?.base_currency ?? currency);
  const rate =
    currency === base_currency
      ? 1
      : Number.isFinite(Number(input?.rate)) && Number(input?.rate) > 0
        ? Number(input?.rate)
        : 1;
  return {
    currency,
    base_currency,
    rate,
    rates_as_of: input?.rates_as_of ?? null,
    provider: input?.provider ?? 'https://www.exchangerate-api.com',
  };
}

/** Convert a stored base-currency amount into the display currency. */
export function convertStoredAmount(amount: number, rate = 1): number {
  if (!Number.isFinite(amount)) return 0;
  const safeRate = Number.isFinite(rate) && rate > 0 ? rate : 1;
  return amount * safeRate;
}

export type FormatMoneyOptions = {
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  /** Multiply stored amount by this FX rate before formatting (base → display). */
  rate?: number;
  convert?: boolean;
};

/** Format a numeric amount using the platform display currency (optionally FX-converted). */
export function formatMoney(
  amount: number,
  currency: AppCurrencyCode | string = DEFAULT_APP_CURRENCY,
  options: FormatMoneyOptions = {},
): string {
  const code = normalizeAppCurrency(currency);
  const shouldConvert = options.convert !== false;
  const value = shouldConvert ? convertStoredAmount(amount, options.rate ?? 1) : amount;
  const maximumFractionDigits = options.maximumFractionDigits ?? 2;
  const minimumFractionDigits =
    options.minimumFractionDigits ?? (maximumFractionDigits === 0 ? 0 : Math.min(2, maximumFractionDigits));

  try {
    return new Intl.NumberFormat(CURRENCY_LOCALES[code], {
      style: 'currency',
      currency: code,
      maximumFractionDigits,
      minimumFractionDigits,
    }).format(Number.isFinite(value) ? value : 0);
  } catch {
    const symbol = CURRENCY_OPTIONS.find((o) => o.code === code)?.symbol ?? code;
    return `${symbol}${(Number.isFinite(value) ? value : 0).toFixed(minimumFractionDigits)}`;
  }
}

export function currencyOptionLabel(code: AppCurrencyCode | string): string {
  const normalized = normalizeAppCurrency(code);
  const option = CURRENCY_OPTIONS.find((o) => o.code === normalized);
  return option ? `${option.label} (${option.code})` : normalized;
}
