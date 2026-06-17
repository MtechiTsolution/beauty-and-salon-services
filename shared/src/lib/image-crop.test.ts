import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  croppedFileName,
  outputMimeTypeForCrop,
  validateImageFile,
} from './image-crop';

describe('image-crop helpers', () => {
  it('outputMimeTypeForCrop preserves png and webp', () => {
    assert.equal(outputMimeTypeForCrop('image/png'), 'image/png');
    assert.equal(outputMimeTypeForCrop('image/webp'), 'image/webp');
    assert.equal(outputMimeTypeForCrop('image/gif'), 'image/jpeg');
  });

  it('croppedFileName updates extension', () => {
    assert.equal(croppedFileName('photo.png', 'image/jpeg'), 'photo-cropped.jpg');
  });

  it('validateImageFile rejects invalid type and size', () => {
    assert.equal(validateImageFile({ type: 'image/bmp', size: 100 } as File), 'Please choose a JPEG, PNG, WebP, or GIF image');
    assert.equal(
      validateImageFile({ type: 'image/png', size: 6 * 1024 * 1024 } as File),
      'Image must be 5 MB or smaller',
    );
    assert.equal(validateImageFile({ type: 'image/png', size: 1000 } as File), null);
  });
});
