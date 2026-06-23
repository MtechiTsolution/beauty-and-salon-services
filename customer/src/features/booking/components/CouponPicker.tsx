import { Button } from '@mit-salon/shared/components/ui/button';
import { Input } from '@mit-salon/shared/components/ui/input';
import { Label } from '@mit-salon/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@mit-salon/shared/components/ui/select';
import type { CouponValidateReason, CustomerCouponOption } from '@mit-salon/shared/lib/coupon-validate';
import {
  formatCouponDiscountLabel,
  formatCouponExpiry,
} from '@mit-salon/shared/lib/coupon-ui';
import { CheckCircle2, Loader2, Tag, X } from 'lucide-react';
import { useState } from 'react';

type CouponPickerProps = {
  options: CustomerCouponOption[];
  isLoading?: boolean;
  orderAmount: number;
  selectedCode: string;
  appliedDiscount: number;
  onCodeChange: (code: string) => void;
  onApply: (code?: string) => void;
  onClear?: () => void;
  isApplying?: boolean;
  signedIn: boolean;
};

function ineligibleHint(reason: CouponValidateReason): string {
  switch (reason) {
    case 'expired':
      return 'Expired';
    case 'already_used':
      return 'Already used';
    case 'max_uses':
      return 'No longer available';
    case 'min_order':
      return 'Min. order not met';
    default:
      return 'Unavailable';
  }
}

function formatOptionLabel(option: CustomerCouponOption): string {
  const { coupon, eligible, reason } = option;
  const discount = formatCouponDiscountLabel(coupon);
  const expiry = formatCouponExpiry(coupon.expiry_date);
  const parts = [`${coupon.code} — ${discount}`];
  if (expiry) parts.push(`Expires ${expiry}`);
  if (!eligible && reason) parts.push(`(${ineligibleHint(reason)})`);
  return parts.join(' · ');
}

export function CouponPicker({
  options,
  isLoading,
  selectedCode,
  appliedDiscount,
  onCodeChange,
  onApply,
  onClear,
  isApplying,
  signedIn,
}: CouponPickerProps) {
  const [manualOpen, setManualOpen] = useState(false);
  const [manualDraft, setManualDraft] = useState('');

  const isApplied = appliedDiscount > 0 && selectedCode.trim().length > 0;
  const selectedCoupon = options.find(
    (o) => o.coupon.code.toUpperCase() === selectedCode.trim().toUpperCase(),
  )?.coupon;

  const eligibleCount = options.filter((o) => o.eligible).length;

  const selectAndApply = (code: string) => {
    const option = options.find((o) => o.coupon.code === code);
    if (option && !option.eligible) return;

    setManualOpen(false);
    setManualDraft('');
    onCodeChange(code);
    onApply(code);
  };

  const handleClear = () => {
    setManualOpen(false);
    setManualDraft('');
    onCodeChange('');
    onClear?.();
  };

  const handleManualApply = () => {
    const code = manualDraft.trim();
    if (!code) return;
    onCodeChange(code.toUpperCase());
    onApply(code);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" aria-hidden />
        <Label className="text-sm font-semibold">Coupon code</Label>
      </div>

      {!signedIn ? (
        <p className="text-sm text-muted-foreground">Sign in to see and apply available coupons.</p>
      ) : isApplied ? (
        <div className="flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="font-mono text-sm font-bold text-green-900">{selectedCode}</p>
              <p className="text-sm text-green-700">
                Applied — you save ${appliedDiscount.toFixed(2)}
                {selectedCoupon ? ` (${formatCouponDiscountLabel(selectedCoupon)})` : ''}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-green-300 bg-white"
            onClick={handleClear}
          >
            Change coupon
          </Button>
        </div>
      ) : (
        <>
          <Select
            value=""
            onValueChange={selectAndApply}
            disabled={isLoading || isApplying || options.length === 0}
          >
            <SelectTrigger className="customer-booking-field h-11 w-full">
              <SelectValue
                placeholder={
                  isLoading
                    ? 'Loading coupons…'
                    : isApplying
                      ? 'Applying coupon…'
                      : options.length === 0
                        ? 'No coupons available'
                        : eligibleCount > 0
                          ? `Select a coupon (${eligibleCount} available)`
                          : 'Select a coupon'
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-[min(16rem,50vh)]">
              {options.map((option) => (
                <SelectItem
                  key={option.coupon.id}
                  value={option.coupon.code}
                  disabled={!option.eligible}
                  className="text-sm"
                >
                  {formatOptionLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {manualOpen ? (
            <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="manual-coupon" className="text-sm font-medium">
                  Enter coupon code
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  aria-label="Close manual entry"
                  onClick={() => {
                    setManualOpen(false);
                    setManualDraft('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  id="manual-coupon"
                  placeholder="Type your code"
                  className="customer-booking-field h-11 min-w-0 flex-1 pl-4 pr-4"
                  value={manualDraft}
                  onChange={(e) => setManualDraft(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleManualApply();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  type="button"
                  className="h-11 shrink-0 px-6"
                  disabled={isApplying || !manualDraft.trim()}
                  onClick={handleManualApply}
                >
                  {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => setManualOpen(true)}
            >
              Have a code not listed? Enter manually
            </button>
          )}
        </>
      )}
    </div>
  );
}
