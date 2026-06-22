import { cn } from '@mit-salon/shared/lib/utils';
import type { ReactNode } from 'react';

type LandingSectionHeaderProps = {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  className?: string;
  align?: 'left' | 'center';
  compact?: boolean;
};

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  className,
  align = 'center',
  compact = false,
}: LandingSectionHeaderProps) {
  const centered = align === 'center';

  return (
    <div className={cn(centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl', className)}>
      {eyebrow ? <div className={cn(centered && 'flex justify-center')}>{eyebrow}</div> : null}
      <h2
        className={cn(
          'landing-section-title font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-[2.65rem]',
          compact ? 'mt-1 sm:mt-1.5' : 'mt-4 sm:mt-5',
        )}
      >
        {title}
      </h2>
      <div className={cn('landing-section-rule', compact ? 'mt-1 sm:mt-1.5' : 'mt-4', centered && 'mx-auto')} />
      {description ? (
        <p
          className={cn(
            'text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg',
            compact ? 'mt-1 sm:mt-1.5' : 'mt-4 sm:mt-5',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
