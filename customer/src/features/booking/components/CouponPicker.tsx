import { useMemo } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Label } from '@mit-salon/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@mit-salon/shared/components/ui/select';
import { useCurrency, useFormatMoney } from '@mit-salon/shared/hooks/useCurrency';
import type { CustomerCouponOption } from '@mit-salon/shared/lib/coupon-validate';
import {
  formatCouponDiscountLabel,
  formatCouponExpiry,
} from '@mit-salon/shared/lib/coupon-ui';
import type { AppCurrencyCode } from '@mit-salon/shared/lib/currency';
import { cn } from '@mit-salon/shared/lib/utils';
import { Check, CheckCircle2, Loader2, Tag } from 'lucide-react';

type CouponPickerProps = {
  options: CustomerCouponOption[];
  isLoading?: boolean;
  orderAmount: number;
  selectedCode: string;
  appliedDiscount: number;
  onCodeChange: (code: string) => void;
  onApply: (code?: string) => void | Promise<void>;
  onClear?: () => void;
  isApplying?: boolean;
  signedIn: boolean;
};

const NO_COUPON_VALUE = '__no_coupon__';

function couponSummaryLabel(
  option: CustomerCouponOption,
  currency: AppCurrencyCode | string,
  rate = 1,
): string {
  const { coupon } = option;
  const discount = formatCouponDiscountLabel(coupon, currency, rate);
  const expiry = formatCouponExpiry(coupon.expiry_date);
  return expiry ? `${coupon.code} · ${discount} · Expires ${expiry}` : `${coupon.code} · ${discount}`;
}

type CouponSelectOptionProps = {
  option: CustomerCouponOption;
};

function CouponSelectItem({ option }: CouponSelectOptionProps) {
  const { currency, rate } = useCurrency();
  const { coupon } = option;
  const discount = formatCouponDiscountLabel(coupon, currency, rate);
  const expiry = formatCouponExpiry(coupon.expiry_date);
  const summary = couponSummaryLabel(option, currency, rate);

  return (
    <SelectPrimitive.Item
      value={coupon.code}
      textValue={summary}
      className={cn(
        'customer-coupon-select-item relative flex w-full cursor-pointer select-none items-start rounded-md py-2.5 pl-9 pr-4 text-sm outline-none transition-colors',
        'focus:bg-muted data-[highlighted]:bg-muted data-[highlighted]:text-foreground',
      )}
    >
      <span className="absolute left-2.5 top-3 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText asChild>
        <div className="customer-coupon-select-item__layout">
          <div className="customer-coupon-select-item__row">
            <p className="customer-coupon-select-item__title">{coupon.code}</p>
            <p className="customer-coupon-select-item__discount">{discount}</p>
          </div>
          {expiry ? <p className="customer-coupon-select-item__meta">Expires {expiry}</p> : null}
        </div>
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function CouponPicker({
  options,
  isLoading,
  orderAmount,
  selectedCode,
  appliedDiscount,
  onCodeChange,
  onApply,
  onClear,
  isApplying,
  signedIn,
}: CouponPickerProps) {
  const { currency, rate } = useCurrency();
  const formatMoney = useFormatMoney();
  const isApplied = appliedDiscount > 0 && selectedCode.trim().length > 0;
  const available = useMemo(() => options.filter((o) => o.eligible), [options]);

  const selectedOption = options.find(
    (o) => o.coupon.code.toUpperCase() === selectedCode.trim().toUpperCase(),
  );
  const selectedCoupon = selectedOption?.coupon;

  const normalizedSelectValue = useMemo(() => {
    if (!selectedCode.trim()) return NO_COUPON_VALUE;
    const match = available.find(
      (o) => o.coupon.code.toUpperCase() === selectedCode.trim().toUpperCase(),
    );
    return match ? match.coupon.code : NO_COUPON_VALUE;
  }, [available, selectedCode]);

  const handleSelect = (value: string) => {
    if (value === NO_COUPON_VALUE) {
      onCodeChange('');
      onClear?.();
      return;
    }
    onCodeChange(value);
  };

  const handleClear = () => {
    onCodeChange('');
    onClear?.();
  };

  const placeholder =
    available.length > 0
      ? `Select a coupon (${available.length} available)`
      : 'No coupons available for this booking';

  const selectedSummary =
    selectedOption && normalizedSelectValue !== NO_COUPON_VALUE
      ? couponSummaryLabel(selectedOption, currency, rate)
      : null;

  return (
    <div className="customer-coupon-picker space-y-3 border-t pt-4">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <Label className="text-sm font-semibold">Coupon code</Label>
      </div>

      {!signedIn ? (
        <p className="text-sm text-muted-foreground">
          Enter your email in the contact section above to see and apply available coupons.
        </p>
      ) : isLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-4 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          Loading your coupons…
        </div>
      ) : isApplied ? (
        <div className="customer-coupon-applied flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/50 dark:bg-green-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            <div className="min-w-0">
              <p className="truncate font-mono text-sm font-bold text-green-900 dark:text-green-100">{selectedCode}</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Applied — you save {formatMoney(appliedDiscount)}
                {selectedCoupon ? ` (${formatCouponDiscountLabel(selectedCoupon, currency, rate)})` : ''}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full"
            onClick={handleClear}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-2">
            <Select value={normalizedSelectValue} onValueChange={handleSelect} disabled={available.length === 0}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder={placeholder}>
                  {selectedSummary ?? placeholder}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_COUPON_VALUE}>No coupon</SelectItem>
                {available.map((option) => (
                  <CouponSelectItem key={option.coupon.id} option={option} />
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            className="h-11 shrink-0 rounded-full px-6"
            disabled={!selectedCode.trim() || isApplying || orderAmount <= 0}
            onClick={() => onApply(selectedCode)}
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying…
              </>
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
