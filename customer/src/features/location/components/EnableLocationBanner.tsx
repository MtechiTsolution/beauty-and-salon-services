import { useCustomerLocation } from '@/features/location/context/CustomerLocationContext';
import { Button } from '@mit-salon/shared/components/ui/button';
import { MapPinned, Navigation } from 'lucide-react';

type EnableLocationBannerProps = {
  className?: string;
};

export function EnableLocationBanner({ className }: EnableLocationBannerProps) {
  const { usingDeviceLocation, status, errorMessage, requestLocation, isLocating } =
    useCustomerLocation();

  if (usingDeviceLocation) return null;

  return (
    <div className={className ?? 'customer-location-banner'}>
      <div className="customer-location-banner__icon-wrap" aria-hidden>
        <MapPinned className="h-5 w-5 text-primary" />
      </div>
      <div className="customer-location-banner__copy min-w-0 flex-1">
        <p className="customer-location-banner__title">Show salons near you</p>
        <p className="customer-location-banner__text">
          {errorMessage ??
            'Use your device location to sort salons by real distance — nearest locations appear first.'}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        className="customer-location-banner__action shrink-0 gap-2 rounded-full"
        disabled={status === 'unsupported' || isLocating}
        onClick={requestLocation}
      >
        <Navigation className="h-4 w-4" />
        {isLocating ? 'Locating…' : status === 'denied' ? 'Try again' : 'Use my location'}
      </Button>
    </div>
  );
}
