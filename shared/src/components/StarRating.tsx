import { cn } from '../lib/utils';
import { Star } from 'lucide-react';
import { useState } from 'react';

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};

type StarIconProps = {
  filled: boolean;
  className?: string;
  strokeWidth?: number;
};

/** Lucide stars need explicit fill + stroke to show solid colored stars */
function StarIcon({ filled, className, strokeWidth }: StarIconProps) {
  return (
    <Star
      aria-hidden
      strokeWidth={strokeWidth ?? (filled ? 1.25 : 1.5)}
      className={cn(
        className,
        'pointer-events-none transition-all duration-150',
        filled ? 'star-icon-filled' : 'star-icon-empty',
      )}
    />
  );
}

type StarRatingProps = {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function StarRating({ value, max = 5, size = 'sm', className }: StarRatingProps) {
  const iconClass =
    size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  const rounded = Math.round(value);

  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      aria-label={`${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} filled={i < rounded} className={iconClass} />
      ))}
    </span>
  );
}

type StarRatingPickerProps = {
  value: number;
  onChange: (value: number) => void;
  size?: 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
};

export function StarRatingPicker({
  value,
  onChange,
  size = 'lg',
  showLabel = true,
  className,
}: StarRatingPickerProps) {
  const [hover, setHover] = useState(0);
  /** How many stars to show filled (hover preview or committed rating) */
  const filledCount = hover > 0 ? hover : value;
  const iconClass = size === 'lg' ? 'h-9 w-9 sm:h-10 sm:w-10' : 'h-7 w-7';

  const select = (star: number) => {
    onChange(star);
    setHover(star);
  };

  return (
    <div className={cn('star-rating-picker flex flex-col items-center gap-3', className)}>
      <div
        className="relative z-20 flex items-center justify-center gap-0.5 sm:gap-1"
        role="radiogroup"
        aria-label="Select rating"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= filledCount;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              className={cn(
                'star-rating-picker-btn inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg',
                'touch-manipulation select-none transition-transform hover:scale-110',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              )}
              onMouseEnter={() => setHover(star)}
              onFocus={() => setHover(star)}
              onBlur={() => setHover(value)}
              onClick={(e) => {
                e.stopPropagation();
                select(star);
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                select(star);
              }}
            >
              <StarIcon filled={filled} className={iconClass} />
            </button>
          );
        })}
      </div>
      {showLabel && (
        <p
          className={cn(
            'min-h-[1.25rem] text-sm font-medium transition-colors',
            filledCount > 0 ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {filledCount > 0 ? RATING_LABELS[filledCount] : 'Tap a star to rate'}
        </p>
      )}
    </div>
  );
}

export { RATING_LABELS };
