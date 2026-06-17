import { EventEmitter } from 'node:events';

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

let catalogVersion = 0;
let chatVersion = 0;

export type SyncPayload = {
  version: number;
  at: number;
  scope: 'catalog' | 'chat';
  chatId?: string;
  chatVersion?: number;
};

/** Call when any catalog/booking data changes (admin or customer). */
export function notifyCatalogChange() {
  catalogVersion += 1;
  const payload: SyncPayload = { version: catalogVersion, at: Date.now(), scope: 'catalog' };
  emitter.emit('change', payload);
}

/** Call when chat messages or read state changes. */
export function notifyChatChange(chatId: string) {
  chatVersion += 1;
  const payload: SyncPayload = {
    version: chatVersion,
    at: Date.now(),
    scope: 'chat',
    chatId,
  };
  emitter.emit('change', payload);
}

export function getCatalogSyncVersion() {
  return { version: catalogVersion, chatVersion, at: Date.now() };
}

export function onCatalogChange(listener: (payload: SyncPayload) => void) {
  emitter.on('change', listener);
  return () => emitter.off('change', listener);
}
