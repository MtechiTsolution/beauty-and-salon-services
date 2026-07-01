import { ViewToggle } from '@mit-salon/shared/components/ViewToggle';
import type { CustomerViewMode } from './useCustomerViewMode';

type CustomerViewToggleProps = {
  view: CustomerViewMode;
  onViewChange: (view: CustomerViewMode) => void;
  className?: string;
};

export function CustomerViewToggle({ view, onViewChange, className }: CustomerViewToggleProps) {
  return (
    <ViewToggle
      className={className}
      view={view}
      onViewChange={onViewChange}
      compactLabels
    />
  );
}
