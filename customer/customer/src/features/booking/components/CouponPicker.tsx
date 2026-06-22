import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { Input } from '@mit-salon/shared/components/ui/input';
import { Label } from '@mit-salon/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@mit-salon/shared/components/ui/select';
import {
  estimateCouponDiscount,
  formatCouponDiscountLabel,
  formatCouponExpiry,
} from '@mit-salon/shared/lib/coupon-ui';
import type { Coupon } from '@mit-salon/shared/types';
import { CheckCircle2, Loader2, Tag, X } from 'lucide-react';
import { useState } from 'react';

type CouponPickerProps = {
  coupons: Coupon[];
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

export function CouponPicker({
  coupons,
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
  const [manualOpen, setManualOpen] = useState(false);
  const [manualDraft, setManualDraft] = useState('');

  const isApplied = appliedDiscount > 0 && selectedCode.trim().length > 0;
  const selectedCoupon = coupons.find(
    (c) => c.code.toUpperCase() === selectedCode.trim().toUpperCase(),
  );

  const selectAndApply = (code: string) => {
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
          {coupons.length > 0 && !manualOpen && (
            <Select
              value={undefined}
              onValueChange={selectAndApply}
              disabled={isLoading || isApplying}
            >
              <SelectTrigger className="customer-booking-field h-11 w-full">
                <SelectValue
                  placeholder={
                    isLoading
                      ? 'Loading coupons…'
                      : isApplying
                        ? 'Applying coupon…'
                        : 'Choose a coupon to apply'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {coupons.map((coupon) => (
                  <SelectItem key={coupon.id} value={coupon.code}>
                    {coupon.code} — {formatCouponDiscountLabel(coupon)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {manualOpen ? (
            <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="manual-coupon" className="text-sm font-medium">
                  Enter coupon code
                </Label>
                {coupons.length > 0 && (
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
                )}
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
              {coupons.length > 0 ? 'Have a code not listed? Enter manually' : 'Enter coupon code manually'}
            </button>
          )}
        </>
      )}

      {!isApplied && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Available for you
          </p>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your coupons…</p>
          ) : coupons.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              No coupons available for this booking right now.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {coupons.map((coupon) => {
                const preview = estimateCouponDiscount(coupon, orderAmount);
                const expiry = formatCouponExpiry(coupon.expiry_date);
                return (
                  <Card
                    key={coupon.id}
                    className="cursor-pointer border border-border/80 transition-shadow hover:border-primary/40 hover:shadow-md"
                    onClick={() => !isApplying && selectAndApply(coupon.code)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-sm font-bold tracking-wide">{coupon.code}</p>
                          <p className="mt-0.5 text-sm font-medium text-primary">
                            {formatCouponDiscountLabel(coupon)}
                          </p>
                        </div>
                        {preview > 0 && (
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            −${preview.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {coupon.min_order > 0
                          ? `Min. order $${coupon.min_order}`
                          : 'No minimum order'}
                        {expiry ? ` · Expires ${expiry}` : ''}
                      </p>
                      <p className="mt-2 text-xs font-medium text-primary">Tap to apply</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
