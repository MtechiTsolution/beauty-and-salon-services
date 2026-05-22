import type { NextFunction, Request, Response } from 'express';
import { notifyCatalogChange } from '../lib/catalogSync.js';

const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

/** Paths that should not broadcast catalog refresh to all clients. */
function shouldSkip(path: string) {
  return (
    path.startsWith('/api/sync') ||
    path === '/api/health' ||
    path.startsWith('/api/auth')
  );
}

function shouldNotify(req: Request, statusCode: number) {
  if (!MUTATION_METHODS.has(req.method)) return false;
  if (shouldSkip(req.path)) return false;
  return statusCode >= 200 && statusCode < 300;
}

/**
 * After any successful write to the API, notify connected admin/customer apps
 * so they refetch lists without a manual refresh.
 */
export function catalogChangeNotifyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!MUTATION_METHODS.has(req.method) || shouldSkip(req.path)) {
    next();
    return;
  }

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  const originalStatus = res.status.bind(res);
  let statusCode = res.statusCode;

  res.status = function status(code: number) {
    statusCode = code;
    return originalStatus(code);
  };

  const maybeNotify = () => {
    if (shouldNotify(req, statusCode)) notifyCatalogChange();
  };

  res.json = function json(body?: unknown) {
    maybeNotify();
    return originalJson(body);
  };

  res.send = function send(body?: unknown) {
    maybeNotify();
    return originalSend(body);
  };

  next();
}
