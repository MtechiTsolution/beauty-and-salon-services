import { LandingCenteredShowcase } from '@/features/welcome/components/LandingCenteredShowcase';
import { LandingCoverImage } from '@/features/welcome/components/LandingCoverImage';
import { branchImageHints } from '@mit-salon/shared/lib/branch-image-hints';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import type { Branch } from '@mit-salon/shared/types';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const bookButtonClass =
  'mt-auto h-10 w-full rounded-full text-sm font-semibold sm:h-11 sm:text-base';

type LandingBranchesCarouselProps = {
  branches: Branch[];
};

export function LandingBranchesCarousel({ branches }: LandingBranchesCarouselProps) {
  const activeBranches = branches.filter((b) => b.status === 'active');
  const bookHref = '/book';

  return (
    <LandingCenteredShowcase
      id="locations"
      wide
      className="landing-section--soft"
      eyebrow={
        <span className="landing-eyebrow">
          <MapPin className="h-4 w-4 text-primary" />
          Our salons
        </span>
      }
      title="Visit us near you"
      description="Premium studios across the metro area — consistent quality, neighborhood convenience, and stylists you can trust."
    >
      {activeBranches.length > 0 ? (
        activeBranches.map((branch) => (
          <Card
            key={branch.id}
            className="landing-showcase-card landing-showcase-card--media flex h-full w-full flex-col overflow-hidden"
          >
            <div className="landing-media-frame aspect-[16/10] shrink-0 overflow-hidden">
              <LandingCoverImage
                src={branch.image_url}
                alt={branch.name}
                kind="branch"
                entityId={branch.id}
                entityName={branch.name}
                entityDescription={branchImageHints(branch)}
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
            <CardContent className="flex flex-1 flex-col p-5 text-center sm:p-6">
              <h3 className="font-heading line-clamp-2 min-h-[3.25rem] text-xl font-semibold leading-snug tracking-tight">
                {branch.name}
              </h3>
              <p className="mt-2 flex min-h-[2.75rem] items-start justify-center gap-2 text-sm leading-relaxed text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="line-clamp-2 text-left">
                  {branch.address}
                  {branch.city ? `, ${branch.city}` : ''}
                </span>
              </p>
              <p className="mt-3 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground">
                {branch.description?.trim() || '\u00A0'}
              </p>
              <Button asChild className={bookButtonClass}>
                <Link to={bookHref}>Book at this location</Link>
              </Button>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="landing-showcase-card col-span-full mx-auto w-full max-w-lg border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            Branch locations appear here once salons are live — sign up to explore and book.
          </CardContent>
        </Card>
      )}
    </LandingCenteredShowcase>
  );
}
