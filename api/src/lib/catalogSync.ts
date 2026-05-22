import { EventEmitter } from 'node:events';

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

let version = 0;

/** Call when any catalog/booking data changes (admin or customer). */
export function notifyCatalogChange() {
  version += 1;
  emitter.emit('change', { version, at: Date.now() });
}

export function getCatalogSyncVersion() {
  return { version, at: Date.now() };
}

export function onCatalogChange(listener: (payload: { version: number; at: number }) => void) {
  emitter.on('change', listener);
  return () => emitter.off('change', listener);
}
