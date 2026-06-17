import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { newId } from '../utils.js';

const UPLOAD_KINDS = ['branches', 'categories', 'services', 'staff', 'packages'] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

const uploadsRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const kind = String(req.query.kind ?? '');
    if (!UPLOAD_KINDS.includes(kind as UploadKind)) {
      cb(new Error('Invalid upload kind'), '');
      return;
    }
    const dir = path.join(uploadsRoot, kind);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    cb(null, `${newId()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
  },
});

export const uploadsRouter = Router();

uploadsRouter.post(
  '/',
  (req, res, next) => {
    const kind = String(req.query.kind ?? '');
    if (!UPLOAD_KINDS.includes(kind as UploadKind)) {
      res.status(400).json({ message: 'Invalid upload kind' });
      return;
    }
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ message: 'Image must be 5 MB or smaller' });
          return;
        }
        res.status(400).json({ message: err.message });
        return;
      }
      if (err) {
        res.status(400).json({ message: err instanceof Error ? err.message : 'Upload failed' });
        return;
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const kind = String(req.query.kind);
    res.status(201).json({ url: `/api/uploads/files/${kind}/${req.file.filename}` });
  }),
);

export function getUploadsRoot(): string {
  return uploadsRoot;
}
