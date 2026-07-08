import { LandingSectionHeader } from '@/features/welcome/components/LandingSectionHeader';
import { cn } from '@mit-salon/shared/lib/utils';
import type { ReactNode } from 'react';

type LandingCenteredShowcaseProps = {
  id?: string;
  eyebrow?: ReactNode;
  title: string;
  description?: ReactNode;
  className?: string;
  wide?: boolean;
  small?: boolean;
  compact?: boolean;
  children: ReactNode;
};

export function LandingCenteredShowcase({
  id,
  eyebrow,
  title,
  description,
  className,
  wide = false,
  small = false,
  compact = false,
  children,
}: LandingCenteredShowcaseProps) {
  return (
    <section
      id={id}
      className={cn('landing-section scroll-mt-20 md:scroll-mt-24', compact && 'landing-section--dense', className)}
    >
      <div className="mx-auto min-w-0 w-full max-w-6xl px-4 sm:px-6">
        <LandingSectionHeader compact={compact} eyebrow={eyebrow} title={title} description={description} />

        <div
          className={cn(
            'landing-center-grid',
            compact ? 'mt-5 sm:mt-6 md:mt-8' : 'mt-8 sm:mt-12 md:mt-14',
            wide && 'landing-center-grid--wide',
            small && 'landing-center-grid--small',
            compact && 'landing-center-grid--compact',
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
