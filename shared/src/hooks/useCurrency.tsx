import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { settingsApi } from '../services/api/modules/settings-api';
import {
  DEFAULT_APP_CURRENCY,
  formatMoney,
  normalizeCurrencySettings,
  type AppCurrencyCode,
  type AppCurrencySettings,
  type FormatMoneyOptions,
} from '../lib/currency';

type CurrencyContextValue = {
  currency: AppCurrencyCode;
  baseCurrency: AppCurrencyCode;
  rate: number;
  ratesAsOf: string | null;
  settings: AppCurrencySettings;
  isLoading: boolean;
  format: (amount: number, options?: FormatMoneyOptions) => string;
  refresh: () => Promise<AppCurrencySettings>;
  setCurrency: (
    currency: AppCurrencyCode,
    baseCurrency?: AppCurrencyCode,
  ) => Promise<AppCurrencySettings>;
};

const defaultSettings = normalizeCurrencySettings({
  currency: DEFAULT_APP_CURRENCY,
  base_currency: DEFAULT_APP_CURRENCY,
  rate: 1,
});

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppCurrencySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const applySettings = useCallback((next: AppCurrencySettings) => {
    const normalized = normalizeCurrencySettings(next);
    setSettings(normalized);
    return normalized;
  }, []);

  const refresh = useCallback(async () => {
    const result = await settingsApi.getCurrency();
    return applySettings(result);
  }, [applySettings]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    settingsApi
      .getCurrency()
      .then((result) => {
        if (!cancelled) applySettings(result);
      })
      .catch(() => {
        if (!cancelled) applySettings(defaultSettings);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applySettings]);

  const setCurrency = useCallback(
    async (currency: AppCurrencyCode, baseCurrency?: AppCurrencyCode) => {
      const result = await settingsApi.updateCurrency({
        currency,
        base_currency: baseCurrency,
      });
      return applySettings(result);
    },
    [applySettings],
  );

  const format = useCallback(
    (amount: number, options?: FormatMoneyOptions) =>
      formatMoney(amount, settings.currency, {
        ...options,
        rate: options?.rate ?? settings.rate,
      }),
    [settings.currency, settings.rate],
  );

  const value = useMemo(
    () => ({
      currency: settings.currency,
      baseCurrency: settings.base_currency,
      rate: settings.rate,
      ratesAsOf: settings.rates_as_of,
      settings,
      isLoading,
      format,
      refresh,
      setCurrency,
    }),
    [settings, isLoading, format, refresh, setCurrency],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: DEFAULT_APP_CURRENCY,
      baseCurrency: DEFAULT_APP_CURRENCY,
      rate: 1,
      ratesAsOf: null,
      settings: defaultSettings,
      isLoading: false,
      format: (amount, options) => formatMoney(amount, DEFAULT_APP_CURRENCY, { ...options, rate: 1 }),
      refresh: async () => defaultSettings,
      setCurrency: async () => defaultSettings,
    };
  }
  return ctx;
}

/** Convenience alias for components that only need formatting. */
export function useFormatMoney() {
  return useCurrency().format;
}
