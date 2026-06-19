import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';
import {
  getCroppedImageFile,
  type Area,
} from '../lib/image-crop';
import { cn } from '../lib/utils';
import { Crop as CropIcon, Loader2, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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

type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DragHandle =
  | 'move'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw';

type DragSession = {
  handle: DragHandle;
  startX: number;
  startY: number;
  startRect: CropRect;
};

const MIN_CROP_PX = 32;

function clampRect(rect: CropRect, boundsW: number, boundsH: number): CropRect {
  let { x, y, width, height } = rect;

  width = Math.max(MIN_CROP_PX, Math.min(width, boundsW));
  height = Math.max(MIN_CROP_PX, Math.min(height, boundsH));
  x = Math.max(0, Math.min(x, boundsW - width));
  y = Math.max(0, Math.min(y, boundsH - height));

  return { x, y, width, height };
}

function applyAspect(rect: CropRect, aspect: number, boundsW: number, boundsH: number): CropRect {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  let width = rect.width;
  let height = width / aspect;

  if (height > boundsH) {
    height = boundsH;
    width = height * aspect;
  }
  if (width > boundsW) {
    width = boundsW;
    height = width / aspect;
  }

  const x = Math.max(0, Math.min(centerX - width / 2, boundsW - width));
  const y = Math.max(0, Math.min(centerY - height / 2, boundsH - height));
  return clampRect({ x, y, width, height }, boundsW, boundsH);
}

function resizeRect(
  handle: DragHandle,
  dx: number,
  dy: number,
  start: CropRect,
  boundsW: number,
  boundsH: number,
  aspect?: number,
): CropRect {
  let { x, y, width, height } = start;

  if (handle === 'move') {
    return clampRect({ x: x + dx, y: y + dy, width, height }, boundsW, boundsH);
  }

  if (handle.includes('n')) {
    const newY = y + dy;
    const newHeight = height - dy;
    if (newHeight >= MIN_CROP_PX) {
      y = newY;
      height = newHeight;
    } else {
      y = y + height - MIN_CROP_PX;
      height = MIN_CROP_PX;
    }
  }
  if (handle.includes('s')) {
    height = Math.max(MIN_CROP_PX, height + dy);
  }
  if (handle.includes('w')) {
    const newX = x + dx;
    const newWidth = width - dx;
    if (newWidth >= MIN_CROP_PX) {
      x = newX;
      width = newWidth;
    } else {
      x = x + width - MIN_CROP_PX;
      width = MIN_CROP_PX;
    }
  }
  if (handle.includes('e')) {
    width = Math.max(MIN_CROP_PX, width + dx);
  }

  let next = clampRect({ x, y, width, height }, boundsW, boundsH);
  if (aspect) {
    next = applyAspect(next, aspect, boundsW, boundsH);
  }
  return next;
}

const EDGE_HANDLES: { handle: DragHandle; className: string; cursor: string }[] = [
  { handle: 'n', className: 'free-crop-handle-n', cursor: 'ns-resize' },
  { handle: 's', className: 'free-crop-handle-s', cursor: 'ns-resize' },
  { handle: 'e', className: 'free-crop-handle-e', cursor: 'ew-resize' },
  { handle: 'w', className: 'free-crop-handle-w', cursor: 'ew-resize' },
];

const CORNER_HANDLES: { handle: DragHandle; className: string; cursor: string }[] = [
  { handle: 'nw', className: 'free-crop-handle-nw', cursor: 'nwse-resize' },
  { handle: 'ne', className: 'free-crop-handle-ne', cursor: 'nesw-resize' },
  { handle: 'sw', className: 'free-crop-handle-sw', cursor: 'nesw-resize' },
  { handle: 'se', className: 'free-crop-handle-se', cursor: 'nwse-resize' },
];

export function ImageCropDialog({
  open,
  onOpenChange,
  file,
  imageSrc,
  aspect,
  onComplete,
  title = 'Crop image',
  description = 'Drag any side or corner to adjust the crop. Nothing is applied until you click Crop & use.',
}: ImageCropDialogProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<DragSession | null>(null);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [processing, setProcessing] = useState(false);

  const resetCropState = useCallback(() => {
    setCropRect(null);
    setImageSize(null);
    dragRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) resetCropState();
  }, [open, resetCropState]);

  useEffect(() => {
    resetCropState();
  }, [imageSrc, resetCropState]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setImageSize({ width, height });

    if (aspect) {
      const maxW = width * 0.9;
      const maxH = height * 0.9;
      let cropW = maxW;
      let cropH = cropW / aspect;
      if (cropH > maxH) {
        cropH = maxH;
        cropW = cropH * aspect;
      }
      setCropRect({
        x: (width - cropW) / 2,
        y: (height - cropH) / 2,
        width: cropW,
        height: cropH,
      });
    } else {
      setCropRect({ x: 0, y: 0, width, height });
    }
  };

  const onPointerMove = useCallback((e: PointerEvent) => {
    const session = dragRef.current;
    if (!session || !imageSize) return;

    const dx = e.clientX - session.startX;
    const dy = e.clientY - session.startY;
    setCropRect(
      resizeRect(
        session.handle,
        dx,
        dy,
        session.startRect,
        imageSize.width,
        imageSize.height,
        aspect,
      ),
    );
  }, [aspect, imageSize]);

  const endDrag = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  }, [onPointerMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, [endDrag, onPointerMove]);

  const startDrag = (handle: DragHandle, e: React.PointerEvent) => {
    if (!cropRect || !imageSize) return;
    e.preventDefault();
    e.stopPropagation();

    dragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startRect: cropRect,
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  };

  const naturalCropArea = (): Area | null => {
    const image = imgRef.current;
    if (!image || !cropRect) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    return {
      x: cropRect.x * scaleX,
      y: cropRect.y * scaleY,
      width: cropRect.width * scaleX,
      height: cropRect.height * scaleY,
    };
  };

  const handleUseOriginal = () => {
    if (!file) return;
    onComplete(file);
    onOpenChange(false);
  };

  const handleCrop = async () => {
    if (!file || !imageSrc) return;
    const pixelCrop = naturalCropArea();
    if (!pixelCrop) return;

    setProcessing(true);
    try {
      const cropped = await getCroppedImageFile(
        imageSrc,
        pixelCrop,
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
    if (!next && !processing) resetCropState();
    onOpenChange(next);
  };

  if (!imageSrc || !file) return null;

  const canCrop = Boolean(cropRect?.width && cropRect?.height);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'image-crop-dialog mit-dialog-content gap-0 overflow-hidden p-0 sm:max-w-[560px]',
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b border-border/80 px-6 pb-4 pt-6">
          <DialogTitle className="font-heading text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="mt-1.5 text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </div>

        <div className="image-crop-stage mx-6 mt-5 rounded-xl bg-muted">
          <div className="free-crop-wrapper inline-block max-w-full">
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="free-crop-img block max-h-[min(50vh,360px)] max-w-full"
              draggable={false}
            />

            {cropRect && imageSize && (
              <div
                className="free-crop-overlay"
                style={{ width: imageSize.width, height: imageSize.height }}
              >
                <div
                  className="free-crop-box"
                  style={{
                    left: cropRect.x,
                    top: cropRect.y,
                    width: cropRect.width,
                    height: cropRect.height,
                  }}
                  onPointerDown={(e) => startDrag('move', e)}
                >
                  {EDGE_HANDLES.map(({ handle, className, cursor }) => (
                    <button
                      key={handle}
                      type="button"
                      aria-label={`Resize ${handle} edge`}
                      className={cn('free-crop-handle free-crop-edge', className)}
                      style={{ cursor }}
                      onPointerDown={(e) => startDrag(handle, e)}
                    />
                  ))}
                  {CORNER_HANDLES.map(({ handle, className, cursor }) => (
                    <button
                      key={handle}
                      type="button"
                      aria-label={`Resize ${handle} corner`}
                      className={cn('free-crop-handle free-crop-corner', className)}
                      style={{ cursor }}
                      onPointerDown={(e) => startDrag(handle, e)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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
            disabled={processing || !canCrop}
            onClick={() => void handleCrop()}
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CropIcon className="h-4 w-4" />
            )}
            Crop & use
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
