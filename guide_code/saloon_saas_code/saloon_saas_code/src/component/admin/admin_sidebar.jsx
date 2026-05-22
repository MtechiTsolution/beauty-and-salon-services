import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Scissors, Users, CalendarDays,
  Tag, Package, BarChart3, Bell, Settings, ChevronLeft, ChevronRight, Grid3X3, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

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

export default function AdminSidebar({ collapsed, setCollapsed }) {
  const location = useLocation();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center">
              <Scissors className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-sidebar-foreground">Frezka</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground h-8 w-8"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
          title={collapsed ? 'View Website' : undefined}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>View Website</span>}
        </Link>
        <button
          onClick={() => base44.auth.logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}