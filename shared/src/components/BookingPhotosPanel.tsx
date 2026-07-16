import { bookingsApi } from '../services/api/modules/bookings';
import { uploadsApi } from '../services/api/modules/uploads';
import {
  canAddMorePhotos,
  canUploadBookingPhotos,
  MAX_BOOKING_PHOTOS_PER_KIND,
  photosByKind,
} from '../lib/booking-photos';
import { IMAGE_UPLOAD_ACCEPT, validateImageFile } from '../lib/image-crop';
import type { Booking, BookingPhoto, BookingPhotoKind } from '../types';
import { cn } from '../lib/utils';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type BookingPhotosPanelProps = {
  booking: Booking;
  onChanged?: (photos: BookingPhoto[]) => void;
  className?: string;
  /** When false, gallery is view-only even if upload is allowed. */
  editable?: boolean;
  compact?: boolean;
  /** Hide outer title/card chrome when embedded in a dialog that already has a header. */
  hideChrome?: boolean;
};

function PhotoGrid({
  label,
  kind,
  photos,
  canEdit,
  busyKind,
  onPick,
  onRemove,
  compact,
}: {
  label: string;
  kind: BookingPhotoKind;
  photos: BookingPhoto[];
  canEdit: boolean;
  busyKind: BookingPhotoKind | 'remove' | null;
  onPick: (kind: BookingPhotoKind, file: File) => void | Promise<void>;
  onRemove: (photo: BookingPhoto) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canAdd = canEdit && photos.length < MAX_BOOKING_PHOTOS_PER_KIND;

  return (
    <section
      className={cn(
        'min-w-0 rounded-lg border border-border/55 bg-muted/15',
        compact ? 'p-2.5' : 'rounded-xl p-3 sm:p-3.5',
      )}
    >
      <div className={cn('flex items-center justify-between gap-2', compact ? 'mb-2' : 'mb-2.5')}>
        <p className={cn('font-semibold tracking-tight text-foreground', compact ? 'text-xs' : 'text-sm')}>
          {label}
        </p>
        <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground ring-1 ring-border/50">
          {photos.length}/{MAX_BOOKING_PHOTOS_PER_KIND}
        </span>
      </div>
      <div
        className={cn(
          'grid gap-1.5',
          compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3',
        )}
      >
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border/50 bg-muted/40 shadow-sm"
          >
            <img
              src={photo.url}
              alt={`${label} photo`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {canEdit ? (
              <button
                type="button"
                className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/95 text-destructive shadow-sm ring-1 ring-border/50 transition hover:bg-destructive hover:text-destructive-foreground sm:opacity-0 sm:group-hover:opacity-100"
                onClick={() => onRemove(photo)}
                disabled={busyKind === 'remove'}
                aria-label={`Remove ${label} photo`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        ))}
        {canAdd ? (
          <button
            type="button"
            className={cn(
              'flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-primary/[0.05] text-primary transition hover:border-primary/60 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60',
              compact ? 'gap-1' : 'gap-1.5 rounded-xl',
            )}
            onClick={() => inputRef.current?.click()}
            disabled={busyKind === kind}
          >
            {busyKind === kind ? (
              <Loader2 className={cn(compact ? 'h-4 w-4' : 'h-5 w-5', 'animate-spin')} />
            ) : (
              <span
                className={cn(
                  'flex items-center justify-center rounded-full bg-primary/12',
                  compact ? 'h-7 w-7' : 'h-8 w-8',
                )}
              >
                <ImagePlus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
              </span>
            )}
            <span className={cn('font-semibold tracking-wide', compact ? 'text-[10px]' : 'text-[11px]')}>
              Add
            </span>
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_UPLOAD_ACCEPT}
        className="hidden"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          void (async () => {
            for (const file of files) {
              await onPick(kind, file);
            }
          })();
        }}
      />
    </section>
  );
}

export function BookingPhotosPanel({
  booking,
  onChanged,
  className,
  editable = true,
  compact,
  hideChrome = false,
}: BookingPhotosPanelProps) {
  const [photos, setPhotos] = useState<BookingPhoto[]>(booking.photos ?? []);
  const [busyKind, setBusyKind] = useState<BookingPhotoKind | 'remove' | null>(null);

  const photoSyncKey = `${booking.id}:${(booking.photos ?? []).map((p) => p.id).join(',')}`;
  useEffect(() => {
    setPhotos(booking.photos ?? []);
  }, [photoSyncKey, booking.photos]);

  const canEdit = editable && canUploadBookingPhotos(booking);
  const before = photosByKind(photos, 'before');
  const after = photosByKind(photos, 'after');
  const hasAny = before.length > 0 || after.length > 0;

  if (!canEdit && !hasAny) return null;

  const commit = (updater: (prev: BookingPhoto[]) => BookingPhoto[]) => {
    setPhotos((prev) => {
      const next = updater(prev);
      onChanged?.(next);
      return next;
    });
  };

  const uploadOne = async (kind: BookingPhotoKind, file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setBusyKind(kind);
    try {
      let blocked = false;
      setPhotos((prev) => {
        if (!canAddMorePhotos(prev, kind)) {
          blocked = true;
          return prev;
        }
        return prev;
      });
      if (blocked) {
        toast.error(`You can upload up to ${MAX_BOOKING_PHOTOS_PER_KIND} ${kind} photos`);
        return;
      }

      const url = await uploadsApi.uploadImage(file, 'booking-photos');
      const photo = await bookingsApi.addPhoto(booking.id, { kind, url });
      commit((prev) => [...prev, photo]);
      toast.success(`${kind === 'before' ? 'Before' : 'After'} photo added`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload photo');
    } finally {
      setBusyKind(null);
    }
  };

  const removeOne = async (photo: BookingPhoto) => {
    setBusyKind('remove');
    try {
      await bookingsApi.removePhoto(booking.id, photo.id);
      commit((prev) => prev.filter((p) => p.id !== photo.id));
      toast.success('Photo removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove photo');
    } finally {
      setBusyKind(null);
    }
  };

  return (
    <div
      className={cn(
        'text-left',
        !hideChrome && 'rounded-xl border border-border/60 bg-card p-3.5 shadow-sm sm:p-4',
        className,
      )}
    >
      {!hideChrome ? (
        <div className="mb-3">
          <p className="text-sm font-semibold tracking-tight text-foreground">Before & after photos</p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            {canEdit
              ? 'Add visit photos once the booking is completed and paid.'
              : 'Photos from this completed visit.'}
          </p>
        </div>
      ) : compact ? (
        <div className="mb-2.5">
          <p className="text-sm font-semibold tracking-tight text-foreground">Before & after</p>
          {canEdit ? (
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Up to {MAX_BOOKING_PHOTOS_PER_KIND} photos each · JPEG, PNG, WebP, GIF · 5 MB max
            </p>
          ) : null}
        </div>
      ) : canEdit ? (
        <p className="mb-3 text-xs leading-snug text-muted-foreground">
          Add up to {MAX_BOOKING_PHOTOS_PER_KIND} photos in each column. JPEG, PNG, WebP, or GIF up to 5 MB.
        </p>
      ) : null}

      <div className={cn('grid gap-2.5', compact ? 'grid-cols-2' : 'sm:grid-cols-2')}>
        <PhotoGrid
          label="Before"
          kind="before"
          photos={before}
          canEdit={canEdit}
          busyKind={busyKind}
          onPick={uploadOne}
          onRemove={removeOne}
          compact={compact}
        />
        <PhotoGrid
          label="After"
          kind="after"
          photos={after}
          canEdit={canEdit}
          busyKind={busyKind}
          onPick={uploadOne}
          onRemove={removeOne}
          compact={compact}
        />
      </div>
    </div>
  );
}
