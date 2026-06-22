import {
  Bell,
  CalendarDays,
  Gift,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Scissors,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type CustomerNavLink = {
  label: string;
  path: string;
  icon: LucideIcon;
  description?: string;
};

export const customerNavLinks: CustomerNavLink[] = [
  { label: 'Home', path: '/landing', icon: Home, description: 'Salon overview & offers' },
  { label: 'Book', path: '/book', icon: Scissors, description: 'Schedule an appointment' },
  { label: 'Explore', path: '/explore', icon: MapPin, description: 'Browse salons & services' },
  { label: 'Packages', path: '/packages', icon: Gift, description: 'View session bundles' },
  { label: 'My bookings', path: '/my-bookings', icon: CalendarDays, description: 'Your appointments & reviews' },
  { label: 'Messages', path: '/messages', icon: MessageCircle, description: 'Chat with the salon' },
  { label: 'Notifications', path: '/notifications', icon: Bell, description: 'Booking updates' },
  { label: 'Contact', path: '/contact', icon: Phone, description: 'Call, email & locations' },
  { label: 'Profile', path: '/profile', icon: User, description: 'Account settings' },
];
