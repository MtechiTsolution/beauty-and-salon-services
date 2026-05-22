import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/shared/components/ui/button';
import { APP_NAME } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/utils';
import {
  BarChart3, Bell, CalendarDays, ChevronLeft, ChevronRight, Grid3X3,
  LayoutDashboard, LogOut, MapPin, Package, Scissors, Tag, Users,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Branches', path: '/admin/branches', icon: MapPin },
  { label: 'Categories', path: '/admin/categories', icon: Grid3X3 },
  { label: 'Services', path: '/admin/services', icon: Scissors },
  { label: 'Staff', path: '/admin/staff', icon: Users },
  { label: 'Bookings', path: '/admin/bookings', icon: CalendarDays },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Coupons', path: '/admin/coupons', icon: Tag },
  { label: 'Packages', path: '/admin/packages', icon: Package },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
];

type AdminSidebarProps = { collapsed: boolean; setCollapsed: (v: boolean) => void };

export function AdminSidebar({ collapsed, setCollapsed }: AdminSidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-40 transition-all',
      collapsed ? 'w-16' : 'w-64',
    )}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link to="/admin" className="font-heading text-lg font-bold text-sidebar-foreground">{APP_NAME}</Link>
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent',
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-lg">
          View website
        </Link>
        <button type="button" onClick={() => logout()} className="flex w-full items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-lg">
          <LogOut className="w-5 h-5" /> {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
