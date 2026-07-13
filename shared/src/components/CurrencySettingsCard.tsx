import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { settingsApi } from '../services/api/modules/settings-api';
import {
  CURRENCY_OPTIONS,
  convertStoredAmount,
  currencyOptionLabel,
  formatMoney,
  type AppCurrencyCode,
  type AppCurrencySettings,
} from '../lib/currency';
import { CircleDollarSign, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type CurrencySettingsCardProps = {
  currency: AppCurrencyCode;
  baseCurrency?: AppCurrencyCode;
  rate?: number;
  ratesAsOf?: string | null;
  isLoading?: boolean;
  canEdit?: boolean;
  title?: string;
  description?: string;
  onSave: (
    currency: AppCurrencyCode,
    baseCurrency: AppCurrencyCode,
  ) => Promise<AppCurrencySettings | AppCurrencyCode>;
};

export function CurrencySettingsCard({
  currency,
  baseCurrency = currency,
  rate = 1,
  ratesAsOf = null,
  isLoading = false,
  canEdit = true,
  title = 'Currency',
  description = 'Stored prices use the base currency. Display currency converts them with live exchange rates.',
  onSave,
}: CurrencySettingsCardProps) {
  const [draftCurrency, setDraftCurrency] = useState<AppCurrencyCode>(currency);
  const [draftBase, setDraftBase] = useState<AppCurrencyCode>(baseCurrency);
  const [previewRate, setPreviewRate] = useState(rate);
  const [previewAsOf, setPreviewAsOf] = useState<string | null>(ratesAsOf);
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    setDraftCurrency(currency);
    setDraftBase(baseCurrency);
    setPreviewRate(rate);
    setPreviewAsOf(ratesAsOf);
  }, [currency, baseCurrency, rate, ratesAsOf]);

  const dirty = draftCurrency !== currency || draftBase !== baseCurrency;

  useEffect(() => {
    if (!dirty) return;
    let cancelled = false;
    setPreviewLoading(true);
    settingsApi
      .convertCurrency(1, draftBase, draftCurrency)
      .then((result) => {
        if (cancelled) return;
        setPreviewRate(result.rate);
        setPreviewAsOf(result.rates_as_of);
      })
      .catch(() => {
        if (!cancelled) setPreviewRate(draftBase === draftCurrency ? 1 : previewRate);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- previewRate intentionally excluded
  }, [dirty, draftBase, draftCurrency]);

  const sample = useMemo(() => {
    const converted = convertStoredAmount(100, previewRate);
    return {
      from: formatMoney(100, draftBase, { rate: 1, convert: false }),
      to: formatMoney(converted, draftCurrency, { rate: 1, convert: false }),
    };
  }, [draftBase, draftCurrency, previewRate]);

  const handleSave = async () => {
    if (!canEdit || !dirty) return;
    setSaving(true);
    try {
      const result = await onSave(draftCurrency, draftBase);
      const nextCurrency = typeof result === 'string' ? result : result.currency;
      const nextBase = typeof result === 'string' ? draftBase : result.base_currency;
      const nextRate = typeof result === 'string' ? previewRate : result.rate;
      const nextAsOf = typeof result === 'string' ? previewAsOf : result.rates_as_of;
      setDraftCurrency(nextCurrency);
      setDraftBase(nextBase);
      setPreviewRate(nextRate);
      setPreviewAsOf(nextAsOf);
      toast.success(
        `Currency updated — prices convert from ${currencyOptionLabel(nextBase)} to ${currencyOptionLabel(nextCurrency)}`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update currency');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="max-md:px-4 max-md:py-3">
        <CardTitle className="flex items-center gap-2 text-lg max-md:text-base">
          <CircleDollarSign className="h-5 w-5" aria-hidden />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground max-md:text-xs">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4 max-md:px-4 max-md:pb-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading currency…
          </div>
        ) : (
          <>
            <div className="grid gap-4 max-w-xl sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="app-base-currency">Base currency (stored prices)</Label>
                <select
                  id="app-base-currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={draftBase}
                  disabled={!canEdit || saving}
                  onChange={(e) => setDraftBase(e.target.value as AppCurrencyCode)}
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label} ({option.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="app-display-currency">Display currency (shown to users)</Label>
                <select
                  id="app-display-currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={draftCurrency}
                  disabled={!canEdit || saving}
                  onChange={(e) => setDraftCurrency(e.target.value as AppCurrencyCode)}
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label} ({option.code}) — {option.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2 font-medium text-foreground">
                {previewLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                Live rate: 1 {draftBase} = {previewRate.toFixed(previewRate >= 100 ? 2 : 4)}{' '}
                {draftCurrency}
              </div>
              <p className="mt-1 text-muted-foreground">
                Example conversion: {sample.from} → {sample.to}
              </p>
              {previewAsOf ? (
                <p className="mt-1 text-xs text-muted-foreground">Rates as of {previewAsOf}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                Exchange rates via{' '}
                <a
                  href="https://www.exchangerate-api.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  ExchangeRate-API
                </a>
                . Catalog amounts stay in base currency; apps show converted values.
              </p>
            </div>

            {canEdit ? (
              <Button type="button" onClick={handleSave} disabled={!dirty || saving || previewLoading}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save & apply conversion'
                )}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Displaying {currencyOptionLabel(currency)} from base {currencyOptionLabel(baseCurrency)}.
                Only salon owners can change it.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
