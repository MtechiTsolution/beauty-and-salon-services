import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { getCroppedImageFile, type Area } from '../lib/image-crop';
import { cn } from '../lib/utils';
import { Crop, Loader2, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';

type ImageCropDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  imageSrc: string | null;
  aspect?: number;
  onComplete: (file: File) => void;
  title?: string;
  description?: string;
};

export function ImageCropDialog({
  open,
  onOpenChange,
  file,
  imageSrc,
  aspect,
  onComplete,
  title = 'Crop image',
  description = 'Drag to reposition and use the slider to zoom. You can crop or upload the original.',
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleUseOriginal = () => {
    if (!file) return;
    onComplete(file);
    onOpenChange(false);
  };

  const handleCrop = async () => {
    if (!file || !imageSrc || !croppedAreaPixels) return;
    setProcessing(true);
    try {
      const cropped = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        file.name,
        file.type,
      );
      onComplete(cropped);
      onOpenChange(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && !processing) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
    onOpenChange(next);
  };

  if (!imageSrc || !file) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'image-crop-dialog mit-dialog-content gap-0 overflow-hidden p-0 sm:max-w-[520px]',
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b border-border/80 px-6 pb-4 pt-6">
          <DialogTitle className="font-heading text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </div>

        <div className="image-crop-stage relative mx-6 mt-5 overflow-hidden rounded-xl bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
        </div>

        <div className="space-y-2 px-6 py-5">
          <Label htmlFor="image-crop-zoom" className="text-sm font-medium">
            Zoom
          </Label>
          <input
            id="image-crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="image-crop-zoom w-full accent-primary"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border/80 bg-card px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            disabled={processing}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 rounded-full"
            disabled={processing}
            onClick={handleUseOriginal}
          >
            <Upload className="h-4 w-4" />
            Use original
          </Button>
          <Button
            type="button"
            className="gap-2 rounded-full"
            disabled={processing || !croppedAreaPixels}
            onClick={() => void handleCrop()}
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crop className="h-4 w-4" />
            )}
            Crop & use
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
