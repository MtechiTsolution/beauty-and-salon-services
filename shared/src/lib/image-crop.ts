import type { Area } from 'react-easy-crop';

export type { Area };

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('Could not load image')));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

export function outputMimeTypeForCrop(inputType: string): string {
  if (inputType === 'image/png' || inputType === 'image/webp') return inputType;
  return 'image/jpeg';
}

export function croppedFileName(originalName: string, mimeType: string): string {
  const base = originalName.replace(/\.[^.]+$/, '') || 'image';
  const ext = MIME_EXT[mimeType] ?? 'jpg';
  return `${base}-cropped.${ext}`;
}

export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: Area,
  originalName: string,
  inputType: string,
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare image canvas');

  canvas.width = Math.max(1, Math.round(pixelCrop.width));
  canvas.height = Math.max(1, Math.round(pixelCrop.height));

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const mimeType = outputMimeTypeForCrop(inputType);
  const quality = mimeType === 'image/jpeg' ? 0.92 : undefined;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error('Could not crop image'));
          return;
        }
        resolve(result);
      },
      mimeType,
      quality,
    );
  });

  return new File([blob], croppedFileName(originalName, mimeType), { type: mimeType });
}

export const IMAGE_UPLOAD_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
    return 'Please choose a JPEG, PNG, WebP, or GIF image';
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return 'Image must be 5 MB or smaller';
  }
  return null;
}
