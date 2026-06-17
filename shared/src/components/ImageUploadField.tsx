import { uploadsApi, type UploadKind } from '../services/api/modules/uploads';
import { CoverImage } from './CoverImage';
import { ImageCropDialog } from './ImageCropDialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import type { EntityImageKind } from '../lib/entity-image';
import {
  IMAGE_UPLOAD_ACCEPT,
  validateImageFile,
} from '../lib/image-crop';
import { cn } from '../lib/utils';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const UPLOAD_KIND_BY_IMAGE: Record<EntityImageKind, UploadKind> = {
  branch: 'branches',
  category: 'categories',
  service: 'services',
  staff: 'staff',
  package: 'packages',
};

export type ImageUploadFieldProps = {
  label?: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  kind: EntityImageKind;
  entityId?: string;
  entityName?: string;
  entityDescription?: string;
  optional?: boolean;
  hint?: string;
  previewClassName?: string;
  cropAspect?: number;
  className?: string;
  showLabel?: boolean;
};

export function ImageUploadField({
  label = 'Image',
  value,
  onChange,
  kind,
  entityId,
  entityName,
  entityDescription,
  optional,
  hint = 'JPEG, PNG, WebP, or GIF up to 5 MB. You can crop after selecting.',
  previewClassName,
  cropAspect,
  className,
  showLabel = true,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (cropSrc) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  const clearCropState = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setPendingFile(null);
    setCropOpen(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadsApi.uploadImage(file, UPLOAD_KIND_BY_IMAGE[kind]);
      onChange(url);
      toast.success('Image uploaded');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      clearCropState();
    }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setPendingFile(file);
    setCropSrc(objectUrl);
    setCropOpen(true);
  };

  const handleCropComplete = (file: File) => {
    void uploadFile(file);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <Label className="text-sm font-medium text-foreground">
          {label}
          {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
        </Label>
      )}
      <div className="space-y-3">
        <div
          className={cn(
            'admin-image-preview relative overflow-hidden rounded-xl border border-border/80 bg-muted/30',
            previewClassName ?? 'h-44 w-full',
          )}
        >
          <CoverImage
            src={value}
            alt={entityName ?? label}
            kind={kind}
            entityId={entityId}
            entityName={entityName}
            entityDescription={entityDescription}
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            {value ? 'Replace image' : 'Upload image'}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => onChange(undefined)}
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              Remove
            </Button>
          )}
        </div>
        {showLabel && hint && (
          <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
        )}
      </div>

      <ImageCropDialog
        open={cropOpen}
        onOpenChange={(open) => {
          if (!open && !uploading) clearCropState();
          else setCropOpen(open);
        }}
        file={pendingFile}
        imageSrc={cropSrc}
        aspect={cropAspect}
        onComplete={handleCropComplete}
      />
    </div>
  );
}
