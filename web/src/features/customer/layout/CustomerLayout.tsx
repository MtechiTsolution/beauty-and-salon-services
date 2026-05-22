import { Outlet } from 'react-router-dom';
import { CustomerFooter } from './CustomerFooter';
import { CustomerNavbar } from './CustomerNavbar';

export function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  );
}
