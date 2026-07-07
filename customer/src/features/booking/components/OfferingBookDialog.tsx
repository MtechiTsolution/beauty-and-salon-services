import {
  getBranchesForPackage,
  getBranchesForService,
} from '@/features/packages/lib/package-branches';
import { branchesApi, servicesApi } from '@mit-salon/shared/api';
import { CoverImage } from '@mit-salon/shared/components/CoverImage';
import { branchImageHints } from '@mit-salon/shared/lib/branch-image-hints';
import { packageDurationMinutes } from '@mit-salon/shared/lib/package-duration';
import { Button } from '@mit-salon/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@mit-salon/shared/components/ui/dialog';
import type { Branch, Package, Service } from '@mit-salon/shared/types';
import { useQuery } from '@tanstack/react-query';
import { Clock, Gift, MapPin, Scissors } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type OfferingBookDialogProps = {
  service?: Service | null;
  pkg?: Package | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OfferingBookDialog({ service, pkg, open, onOpenChange }: OfferingBookDialogProps) {
  const navigate = useNavigate();
  const resolvedService = service ?? null;
  const resolvedPackage = pkg ?? null;
  const offering = resolvedService ?? resolvedPackage;
  const isPackage = resolvedPackage != null;

  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['branches-offering-book'],
    queryFn: () => branchesApi.list(),
    enabled: open && offering != null,
  });

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['services-offering-book'],
    queryFn: () => servicesApi.list(),
    enabled: open && isPackage,
  });

  if (!open || !offering) {
    return null;
  }

  const availableBranches = isPackage
    ? getBranchesForPackage(resolvedPackage, branches, services)
    : getBranchesForService(resolvedService!, branches);
  const isLoading = loadingBranches || (isPackage && loadingServices);

  const handleSelectBranch = (branch: Branch) => {
    onOpenChange(false);
    if (isPackage) {
      navigate(`/book?package=${encodeURIComponent(resolvedPackage.id)}&branch=${encodeURIComponent(branch.id)}`);
      return;
    }
    navigate(`/book?service=${encodeURIComponent(resolvedService!.id)}&branch=${encodeURIComponent(branch.id)}`);
  };

  const title = isPackage ? resolvedPackage.name : resolvedService!.title;
  const subtitle = isPackage ? (
    <>
      ${resolvedPackage.price} · {resolvedPackage.total_sessions} session
      {resolvedPackage.total_sessions === 1 ? '' : 's'} · ~{packageDurationMinutes(resolvedPackage, services)} min visit
    </>
  ) : (
    <>
      ${resolvedService!.price} · {resolvedService!.duration_minutes} min
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="customer-package-book-dialog mit-dialog-content max-h-[min(90vh,36rem)] w-[min(92vw,28rem)] flex-col overflow-hidden p-0">
        <DialogTitle className="sr-only">Choose salon for {isPackage ? 'package' : 'service'}</DialogTitle>
        <DialogDescription className="sr-only">
          Select a salon location where this {isPackage ? 'package' : 'service'} is available.
        </DialogDescription>

        <div className="border-b px-5 py-4">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {isPackage ? <Gift className="h-3.5 w-3.5" /> : <Scissors className="h-3.5 w-3.5" />}
            Book {isPackage ? 'package' : 'service'}
          </p>
          <h2 className="font-heading mt-1 text-lg font-semibold">{title}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            {isPackage ? null : <Clock className="h-3.5 w-3.5 shrink-0" />}
            {subtitle}
          </p>
          <p className="mt-2 text-sm text-foreground">Choose the salon for your appointment</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading locations…</p>
          ) : availableBranches.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-10 text-center">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium">
                No salons available for this {isPackage ? 'package' : 'service'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This offering may not be linked to any salon yet.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {availableBranches.map((branch) => (
                <li key={branch.id}>
                  <button
                    type="button"
                    className="customer-package-book-branch flex w-full items-center gap-3 rounded-xl border border-border/80 bg-card p-3 text-left transition hover:border-primary/40 hover:bg-primary/5"
                    onClick={() => handleSelectBranch(branch)}
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                      <CoverImage
                        src={branch.image_url}
                        alt={branch.name}
                        kind="branch"
                        entityId={branch.id}
                        entityName={branch.name}
                        entityDescription={branchImageHints(branch)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{branch.name}</span>
                      <span className="mt-0.5 flex items-start gap-1 text-xs text-muted-foreground">
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                        <span className="line-clamp-2">
                          {branch.address}
                          {branch.city ? `, ${branch.city}` : ''}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t px-5 py-3">
          <Button type="button" variant="outline" className="w-full rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
