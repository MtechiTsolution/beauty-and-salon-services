import { useCustomerBranches } from '@/features/location/hooks/useCustomerBranches';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { branchImageHints } from '@mit-salon/shared/lib/branch-image-hints';
import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { APP_NAME, SALON_SUPPORT } from '@mit-salon/shared/lib/constants';
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Scissors,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function ContactLink({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/80 p-4 transition hover:border-primary/30 hover:bg-primary/5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="mt-0.5 block font-medium text-foreground break-all">{value}</span>
      </span>
    </a>
  );
}

export default function ContactPage() {
  const { data: branches = [], isLoading } = useCustomerBranches({ queryKeyPrefix: 'branches-contact' });

  const activeBranches = branches.filter((b) => b.status === 'active');
  const phoneHref = `tel:${SALON_SUPPORT.phone.replace(/[^\d+]/g, '')}`;

  return (
    <div className="customer-page">
      <section className="border-b bg-card/60 backdrop-blur-sm">
        <div className="customer-container-wide py-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Scissors className="h-4 w-4" /> We&apos;re here to help
          </span>
          <h1 className="font-heading mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            Contact {APP_NAME}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            Reach our reception team for booking help, service questions, or directions to any location.
          </p>
        </div>
      </section>

      <section className="customer-container-wide py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <ContactLink
            href={phoneHref}
            icon={Phone}
            label="Call us"
            value={SALON_SUPPORT.phone}
          />
          <ContactLink
            href={`mailto:${SALON_SUPPORT.email}`}
            icon={Mail}
            label="Email"
            value={SALON_SUPPORT.email}
          />
          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/80 p-4 md:col-span-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Opening hours
              </span>
              <span className="mt-0.5 block text-sm font-medium leading-relaxed">{SALON_SUPPORT.hours}</span>
            </span>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-5xl flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/book">Book an appointment</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8">
            <Link to="/messages">
              <MessageCircle className="mr-2 h-4 w-4" />
              Message the salon
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-t bg-muted/20">
        <div className="customer-container-wide py-12 md:py-16">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">Our salons</h2>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              Contact details for each {APP_NAME} location.
            </p>
            <Button asChild variant="outline" className="shrink-0 rounded-full">
              <Link to="/salons">Browse all salon profiles</Link>
            </Button>
          </div>

          {isLoading ? (
            <p className="mt-8 text-muted-foreground">Loading locations…</p>
          ) : activeBranches.length === 0 ? (
            <Card className="mt-8 border-0 shadow-md">
              <CardContent className="py-12 text-center text-muted-foreground">
                No salon locations listed yet. Use the general contact details above.
              </CardContent>
            </Card>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {activeBranches.map((b) => (
                <Card key={b.id} className="customer-card-hover overflow-hidden border-0 shadow-md">
                  <div className="aspect-[16/7] overflow-hidden">
                    <CoverImage
                      src={b.image_url}
                      alt={b.name}
                      kind="branch"
                      entityId={b.id}
                      entityName={b.name}
                      entityDescription={branchImageHints(b)}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="space-y-4 p-6">
                    <h3 className="font-heading text-xl font-semibold">{b.name}</h3>

                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>
                        {b.address}
                        {b.city ? `, ${b.city}` : ''}
                      </span>
                    </p>

                    {b.phone && (
                      <a
                        href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {b.phone}
                      </a>
                    )}

                    {b.email && (
                      <a
                        href={`mailto:${b.email}`}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline break-all"
                      >
                        <Mail className="h-4 w-4 shrink-0" />
                        {b.email}
                      </a>
                    )}

                    {!b.phone && !b.email && (
                      <p className="text-sm text-muted-foreground">
                        Call {SALON_SUPPORT.phone} or email {SALON_SUPPORT.email}
                      </p>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button asChild variant="outline" className="flex-1 rounded-full">
                        <Link to={`/salons/${encodeURIComponent(b.id)}`}>View profile</Link>
                      </Button>
                      <Button asChild className="flex-1 rounded-full">
                        <Link to={`/book?branch=${encodeURIComponent(b.id)}`}>Book here</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
