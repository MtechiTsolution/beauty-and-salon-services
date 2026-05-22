import { delay, nextId, store, type MockStore } from '../mock/store';
import type { BaseEntity } from '@/shared/types';

type CollectionKey = {
  [K in keyof MockStore]: MockStore[K] extends BaseEntity[] ? K : never;
}[keyof MockStore];

function getCollection<T extends BaseEntity>(collection: CollectionKey): T[] {
  return store[collection] as unknown as T[];
}

export function createCrudApi<T extends BaseEntity>(collection: CollectionKey) {
  return {
    async list(): Promise<T[]> {
      await delay();
      return [...getCollection<T>(collection)];
    },
    async get(id: string): Promise<T | undefined> {
      await delay();
      return getCollection<T>(collection).find((item) => item.id === id);
    },
    async create(data: Omit<T, keyof BaseEntity>): Promise<T> {
      await delay();
      const item = {
        ...data,
        id: nextId(String(collection)),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as T;
      getCollection<T>(collection).push(item);
      return item;
    },
    async update(id: string, data: Partial<T>): Promise<T> {
      await delay();
      const items = getCollection<T>(collection);
      const idx = items.findIndex((item) => item.id === id);
      if (idx === -1) throw new Error('Not found');
      items[idx] = { ...items[idx], ...data, updated_at: new Date().toISOString() };
      return items[idx];
    },
    async delete(id: string): Promise<void> {
      await delay();
      const items = getCollection<T>(collection);
      const idx = items.findIndex((item) => item.id === id);
      if (idx !== -1) items.splice(idx, 1);
    },
  };
}
