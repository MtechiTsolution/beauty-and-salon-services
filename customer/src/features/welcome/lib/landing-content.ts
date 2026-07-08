import { APP_HERO_IMAGE } from '@mit-salon/shared/lib/brand';
import {
  BRANCH_IMAGE_POOL,
  SERVICE_IMAGE_POOL,
  STAFF_IMAGE_POOL,
} from '@mit-salon/shared/lib/salon-image-pool';
import {
  Bell,
  CalendarDays,
  Gift,
  MapPin,
  MessageCircle,
  Phone,
  Scissors,
  Star,
  Tag,
  User,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type LandingHeroSlide = {
  image: string;
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
};

export const landingHeroSlides: LandingHeroSlide[] = [
  {
    image: APP_HERO_IMAGE,
    eyebrow: 'Book · Explore · Chat · Review',
    title: 'Your salon visit,',
    highlight: 'start to finish',
    subtitle: 'Book appointments, message reception, and manage every visit from one beautiful customer app.',
  },
  {
    image: BRANCH_IMAGE_POOL[2] ?? APP_HERO_IMAGE,
    eyebrow: 'Premium locations',
    title: 'Salons near',
    highlight: 'you',
    subtitle: 'Browse branches across the city — same quality standards, neighborhood convenience.',
  },
  {
    image: SERVICE_IMAGE_POOL[0] ?? APP_HERO_IMAGE,
    eyebrow: 'Expert treatments',
    title: 'Services &',
    highlight: 'packages',
    subtitle: 'From cuts and color to spa bundles — pick a single service or save with session packages.',
  },
  {
    image: STAFF_IMAGE_POOL[0] ?? APP_HERO_IMAGE,
    eyebrow: 'Top-rated team',
    title: 'Stylists you',
    highlight: 'trust',
    subtitle: 'Choose your preferred stylist, see ratings, and book with confidence.',
  },
];

export type LandingTestimonial = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  service_title?: string;
  service_id?: string;
  branch_name?: string;
  branch_id?: string;
  employee_name?: string;
};

export const fallbackTestimonials: LandingTestimonial[] = [
  {
    id: 't1',
    customer_name: 'Sarah M.',
    rating: 5,
    comment:
      'Booking took less than two minutes. I loved picking my stylist and getting instant confirmation — the chat with reception was a nice touch.',
    service_title: 'Haircut & Blowout',
    branch_name: 'Downtown Studio',
  },
  {
    id: 't2',
    customer_name: 'James K.',
    rating: 5,
    comment:
      'The package deal saved me money on regular visits. My bookings are all in one place and reminders keep me on schedule.',
    service_title: 'Grooming Package',
    branch_name: 'Uptown Salon',
  },
  {
    id: 't3',
    customer_name: 'Priya R.',
    rating: 5,
    comment:
      'Clean app, easy rescheduling, and I left a review right after my visit. Felt like a premium experience without the hassle.',
    service_title: 'Color Treatment',
    employee_name: 'Alex Rivera',
  },
  {
    id: 't4',
    customer_name: 'Michael T.',
    rating: 4,
    comment:
      'Explored services before signing up, then booked the same evening. Payment options were flexible and staff were professional.',
    service_title: 'Deep Massage',
    branch_name: 'Brooklyn Branch',
  },
];

export type LandingFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  requiresAuth?: boolean;
};

export const landingFeatures: LandingFeature[] = [
  {
    icon: Scissors,
    title: 'Book appointments',
    description:
      'Choose your salon, service or package, stylist, date & time, then pay — all in a guided 6-step flow.',
    path: '/book',
    requiresAuth: true,
  },
  {
    icon: MapPin,
    title: 'Explore salons',
    description:
      'Browse branches, services, categories, and stylists before you book. Compare options at your own pace.',
    path: '/explore',
    requiresAuth: true,
  },
  {
    icon: Gift,
    title: 'Packages & bundles',
    description:
      'Save with multi-session packages. Book a bundle instead of a single service when it fits your routine.',
    path: '/packages',
    requiresAuth: true,
  },
  {
    icon: Tag,
    title: 'Coupons & offers',
    description:
      'Apply promo codes at checkout during booking. Salon announcements and offers land in your notifications.',
    path: '/book',
    requiresAuth: true,
  },
  {
    icon: CalendarDays,
    title: 'My bookings',
    description:
      'Track upcoming and past visits, filter by date, cancel when allowed, and leave reviews after completed paid visits.',
    path: '/my-bookings',
    requiresAuth: true,
  },
  {
    icon: MessageCircle,
    title: 'Salon messages',
    description:
      'Chat with reception about your appointment — timing, services, or questions. Opens automatically when you book.',
    path: '/messages',
    requiresAuth: true,
  },
  {
    icon: Bell,
    title: 'Notifications',
    description:
      'Get booking confirmations, status changes, payment updates, and salon announcements in one place.',
    path: '/notifications',
    requiresAuth: true,
  },
  {
    icon: Phone,
    title: 'Contact & support',
    description:
      'Call, email, or find hours for every branch. Reach the salon team when you need help outside the app.',
    path: '/contact',
    requiresAuth: true,
  },
  {
    icon: User,
    title: 'Your profile',
    description: 'Update your name, phone, and account details. Manage how you appear on bookings and messages.',
    path: '/profile',
    requiresAuth: true,
  },
];

export const landingBookingSteps = [
  { step: 1, title: 'Pick a salon', description: 'Choose the branch nearest you' },
  { step: 2, title: 'Service or package', description: 'Select what you want done' },
  { step: 3, title: 'Choose stylist', description: 'Book with your preferred staff' },
  { step: 4, title: 'Date & time', description: 'See live availability' },
  { step: 5, title: 'Payment', description: 'Card, wallet, or pay at salon' },
  { step: 6, title: 'Confirm', description: 'You’re booked — chat opens instantly' },
] as const;
