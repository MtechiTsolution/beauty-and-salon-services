import { createRestCrudApi } from './rest-crud';
import type { BaseEntity } from '../../../types';

export function createDataApi<T extends BaseEntity>(resource: string) {
  return createRestCrudApi<T>(resource);
}
