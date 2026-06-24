import type { MouseEvent } from 'react';

export const CUSTOMER_HOME_PATH = '/landing';

export function isCustomerHomePath(pathname: string) {
  return pathname === CUSTOMER_HOME_PATH || pathname === '/';
}

export function handleCustomerHomeClick(
  event: MouseEvent<HTMLAnchorElement>,
  pathname: string,
) {
  if (isCustomerHomePath(pathname)) {
    event.preventDefault();
    window.location.assign(CUSTOMER_HOME_PATH);
  }
}
