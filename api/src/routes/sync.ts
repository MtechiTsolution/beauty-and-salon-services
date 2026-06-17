import { Router } from 'express';
import { SyncPayload, getCatalogSyncVersion, onCatalogChange } from '../lib/catalogSync.js';

export const syncRouter = Router();

/** Long-poll friendly version check (fallback if SSE unavailable). */
syncRouter.get('/version', (_req, res) => {
  res.json(getCatalogSyncVersion());
});

/** Server-Sent Events — both admin & customer apps listen for instant updates. */
syncRouter.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (payload: SyncPayload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const initial = getCatalogSyncVersion();
  send({
    version: initial.version,
    at: initial.at,
    scope: 'catalog',
    chatVersion: initial.chatVersion,
  });

  const unsubscribe = onCatalogChange(send);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 25_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});
