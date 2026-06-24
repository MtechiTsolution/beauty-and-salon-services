import { Button } from '@mit-salon/shared/components/ui/button';
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
import { CheckCircle2, Tag } from 'lucide-react';

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
    case 'not_applicable':
      return 'Not applicable';
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
  const isApplied = appliedDiscount > 0 && selectedCode.trim().length > 0;
  const selectedCoupon = options.find(
    (o) => o.coupon.code.toUpperCase() === selectedCode.trim().toUpperCase(),
  )?.coupon;

  const eligibleCount = options.filter((o) => o.eligible).length;

  const selectAndApply = (code: string) => {
    const option = options.find((o) => o.coupon.code === code);
    if (option && !option.eligible) return;

    onCodeChange(code);
    onApply(code);
  };

  const handleClear = () => {
    onCodeChange('');
    onClear?.();
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" aria-hidden />
        <Label className="text-sm font-semibold">Coupon code</Label>
      </div>

      {!signedIn ? (
        <p className="text-sm text-muted-foreground">
          Enter your email in the contact section above to see and apply available coupons.
        </p>
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
      )}
    </div>
  );
}
