import { useCustomerLocation } from '@/features/location/context/CustomerLocationContext';
import { formatDistanceKm } from '@mit-salon/shared/lib/branch-distance';
import { buildBranchDirectionsUrl, canOpenBranchDirections } from '@mit-salon/shared/lib/maps-directions';
import { cn } from '@mit-salon/shared/lib/utils';
import type { Branch } from '@mit-salon/shared/types';
import { MapPin, Navigation } from 'lucide-react';

type BranchNearYouLabelProps = {
  distanceKm?: number | null;
  isNearest?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'overlay';
  branch?: Pick<Branch, 'latitude' | 'longitude' | 'name' | 'address' | 'city'> | null;
};

export function BranchNearYouLabel({
  distanceKm,
  isNearest = false,
  className,
  variant = 'default',
  branch = null,
}: BranchNearYouLabelProps) {
  const { hasLocation, isLocating, coords } = useCustomerLocation();

  if (isLocating && distanceKm == null) return null;

  if (!hasLocation || distanceKm == null) return null;

  const label = formatDistanceKm(distanceKm);
  if (!label) return null;

  const text = isNearest ? `Nearest · ${label}` : label;
  const canOpenDirections = branch != null && canOpenBranchDirections(branch);
  const directionsUrl = canOpenDirections ? buildBranchDirectionsUrl(branch, coords) : null;

  const classNames = cn(
    'customer-nearby-label',
    variant === 'overlay' && 'customer-nearby-label--overlay',
    variant === 'compact' && 'customer-nearby-label--compact',
    isNearest && 'customer-nearby-label--nearest',
    canOpenDirections && 'customer-nearby-label--action',
    className,
  );

  const icon = isNearest ? (
    <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden />
  ) : (
    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
  );

  if (canOpenDirections && directionsUrl) {
    return (
      <button
        type="button"
        className={classNames}
        aria-label={`Get directions · ${text}`}
        title="Open route in Google Maps"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          window.open(directionsUrl, '_blank', 'noopener,noreferrer');
        }}
      >
        {icon}
        {text}
      </button>
    );
  }

  return (
    <span className={classNames} aria-label={text}>
      {icon}
      {text}
    </span>
  );
}
