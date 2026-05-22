import { USE_MOCK_API } from '../client';
import { createCrudApi } from './crud';
import { createRestCrudApi } from './rest-crud';
import type { MockStore } from '../mock/store';
import type { BaseEntity } from '../../../types';

type CollectionKey = {
  [K in keyof MockStore]: MockStore[K] extends BaseEntity[] ? K : never;
}[keyof MockStore];

export function createDataApi<T extends BaseEntity>(resource: CollectionKey) {
  return USE_MOCK_API ? createCrudApi<T>(resource) : createRestCrudApi<T>(resource);
}
