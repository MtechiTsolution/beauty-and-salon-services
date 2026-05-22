import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Catches async errors and passes them to Express error middleware (prevents process crash). */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
