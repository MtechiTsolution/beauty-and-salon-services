import { cn } from '@mit-salon/shared/lib/utils';

type LandingHeroMarqueeSubtitleProps = {
  line1: string;
  line2: string;
  className?: string;
};

function MarqueeLine({
  text,
  direction,
}: {
  text: string;
  direction: 'ltr' | 'rtl';
}) {
  return (
    <div
      className={cn(
        'landing-hero-marquee',
        direction === 'ltr' ? 'landing-hero-marquee--ltr' : 'landing-hero-marquee--rtl',
      )}
    >
      <div className="landing-hero-marquee__track">
        <span className="landing-hero-marquee__text">{text}</span>
        <span className="landing-hero-marquee__text" aria-hidden>
          {text}
        </span>
      </div>
    </div>
  );
}

export function LandingHeroMarqueeSubtitle({
  line1,
  line2,
  className,
}: LandingHeroMarqueeSubtitleProps) {
  return (
    <div className={cn('landing-hero-marquee-wrap', className)}>
      <p className="landing-hero-marquee-static">
        {line1} {line2}
      </p>
      <div className="landing-hero-marquee-flow" aria-hidden>
        <MarqueeLine text={line1} direction="ltr" />
        <MarqueeLine text={line2} direction="rtl" />
      </div>
    </div>
  );
}
