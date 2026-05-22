import type { NextFunction, Request, Response } from 'express';

type MysqlErr = Error & {
  errno?: number;
  code?: string;
  sqlMessage?: string;
};

export function mapDbError(err: MysqlErr): { status: number; message: string } {
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return {
      status: 400,
      message: 'Invalid reference — check branch, category, or staff assignment.',
    };
  }
  if (
    err.code === 'ER_ROW_IS_REFERENCED_2' ||
    err.code === 'ER_ROW_IS_REFERENCED' ||
    err.errno === 1451
  ) {
    return {
      status: 409,
      message:
        'Cannot delete or update this record — other data (bookings, staff, etc.) still depends on it. Remove those links first.',
    };
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return { status: 409, message: 'A record with this value already exists.' };
  }
  if (err.code === 'ER_BAD_NULL_ERROR') {
    return { status: 400, message: 'Required field is missing.' };
  }
  return {
    status: 500,
    message: err.sqlMessage || err.message || 'Server error',
  };
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('[API]', err);
  const e = err as MysqlErr & { status?: number; message?: string };
  if (e.status && e.message) {
    return res.status(e.status).json({ message: e.message });
  }
  const { status, message } = mapDbError(e);
  res.status(status).json({ message });
}
