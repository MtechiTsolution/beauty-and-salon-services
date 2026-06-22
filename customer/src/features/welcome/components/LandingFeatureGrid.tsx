import { useAuth } from '@/features/auth/context/AuthContext';
import { CarouselItem } from '@/components/ui/carousel';
import { LandingCarouselShell } from '@/features/welcome/components/LandingCarouselShell';
import { landingFeatures } from '@/features/welcome/lib/landing-content';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingFeatureGrid() {
  const { isAuthenticated } = useAuth();

  return (
    <LandingCarouselShell
      id="features"
      className="landing-section--soft landing-section--compact-top"
      eyebrow={
        <span className="landing-eyebrow">
          <Sparkles className="h-4 w-4 text-primary" />
          Full platform
        </span>
      }
      title="Everything you need in one app"
      description="From first browse to post-visit review — manage your whole salon experience in one refined customer portal."
      autoplayDelay={5500}
    >
      {landingFeatures.map((feature) => {
        const Icon = feature.icon;
        const href = feature.requiresAuth ? (isAuthenticated ? feature.path : '/register') : feature.path;

        return (
          <CarouselItem key={feature.title} className="basis-[90%] pl-2 sm:basis-1/2 sm:pl-4 lg:basis-1/3">
            <Card className="landing-showcase-card group h-full">
              <CardContent className="flex h-full flex-col p-5 sm:p-7">
                <div className="landing-feature-icon">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-heading mt-5 text-lg font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="mt-5 w-fit gap-1 rounded-full px-0 font-medium text-primary hover:bg-transparent hover:text-primary/80"
                >
                  <Link to={href}>
                    {feature.requiresAuth && !isAuthenticated ? 'Sign up to use' : 'Explore'}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </CarouselItem>
        );
      })}
    </LandingCarouselShell>
  );
}
