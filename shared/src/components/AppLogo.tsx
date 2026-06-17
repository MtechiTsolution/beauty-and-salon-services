import { APP_NAME } from '../lib/constants';
import { APP_LOGO_IMAGE } from '../lib/brand';
import { cn } from '../lib/utils';

const sizeClasses = {
  sm: 'h-9 w-9 rounded-xl',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-14 w-14 rounded-2xl',
  xl: 'h-16 w-16 rounded-2xl',
} as const;

type AppLogoProps = {
  size?: keyof typeof sizeClasses;
  showText?: boolean;
  className?: string;
  textClassName?: string;
  imageClassName?: string;
};

export function AppLogo({
  size = 'md',
  showText = false,
  className,
  textClassName,
  imageClassName,
}: AppLogoProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <img
        src={APP_LOGO_IMAGE}
        alt={APP_NAME}
        className={cn(
          'shrink-0 object-cover object-center shadow-sm ring-2 ring-primary/15',
          sizeClasses[size],
          imageClassName,
        )}
      />
      {showText && (
        <span className={cn('truncate font-heading font-bold', textClassName)}>{APP_NAME}</span>
      )}
    </div>
  );
}
