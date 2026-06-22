import { LandingSectionHeader } from '@/features/welcome/components/LandingSectionHeader';
import { cn } from '@mit-salon/shared/lib/utils';
import type { ReactNode } from 'react';

type LandingCenteredShowcaseProps = {
  id?: string;
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  className?: string;
  wide?: boolean;
  children: ReactNode;
};

export function LandingCenteredShowcase({
  id,
  eyebrow,
  title,
  description,
  className,
  wide = false,
  children,
}: LandingCenteredShowcaseProps) {
  return (
    <section id={id} className={cn('landing-section scroll-mt-20 md:scroll-mt-24', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <LandingSectionHeader eyebrow={eyebrow} title={title} description={description} />

        <div
          className={cn(
            'landing-center-grid mt-8 sm:mt-12 md:mt-14',
            wide && 'landing-center-grid--wide',
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
