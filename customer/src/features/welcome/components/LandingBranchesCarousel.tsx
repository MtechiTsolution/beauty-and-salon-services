import { LandingCenteredShowcase } from '@/features/welcome/components/LandingCenteredShowcase';
import { LandingCoverImage } from '@/features/welcome/components/LandingCoverImage';
import { branchImageHints } from '@mit-salon/shared/lib/branch-image-hints';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import type { Branch } from '@mit-salon/shared/types';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const bookButtonClass =
  'mt-3 h-9 w-full rounded-full text-sm font-semibold max-md:mt-2.5 sm:mt-auto sm:h-10';

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
      compact
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
            className="landing-showcase-card landing-showcase-card--media landing-showcase-card--compact flex h-full w-full flex-col overflow-hidden"
          >
            <div className="landing-media-frame landing-media-frame--compact aspect-[5/3] shrink-0 overflow-hidden">
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
            <CardContent className="landing-branch-showcase-body flex flex-col p-4 text-center sm:flex-1 sm:p-5">
              <h3 className="font-heading line-clamp-2 text-lg font-semibold leading-snug tracking-tight">
                {branch.name}
              </h3>
              <p className="mt-1.5 flex items-center justify-center gap-1.5 text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="line-clamp-2">
                  {branch.address}
                  {branch.city ? `, ${branch.city}` : ''}
                </span>
              </p>
              {branch.description?.trim() ? (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {branch.description.trim()}
                </p>
              ) : null}
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
