import { OfferingBookDialog } from '@/features/booking/components/OfferingBookDialog';
import type { Package } from '@mit-salon/shared/types';

type PackageBookDialogProps = {
  pkg: Package | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PackageBookDialog({ pkg, open, onOpenChange }: PackageBookDialogProps) {
  return <OfferingBookDialog pkg={pkg} open={open} onOpenChange={onOpenChange} />;
}
