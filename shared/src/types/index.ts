import type { StaffRole } from '../lib/staff-roles';

export type Status = 'active' | 'inactive';
export type BranchStatus = 'active' | 'inactive' | 'pending' | 'blocked';
export type SalonRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface User extends BaseEntity {
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
}

export interface Branch extends BaseEntity {
  name: string;
  address: string;
  city?: string;
  /** Decimal degrees — used for near-you salon sorting. */
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  image_url?: string;
  description?: string;
  /** Daily opening time in HH:mm (24-hour). */
  opening_time?: string;
  /** Daily closing time in HH:mm (24-hour). */
  closing_time?: string;
  status: BranchStatus;
  owner_user_id?: string;
  /** Kilometres from customer device when listing with lat/lng query params. */
  distance_km?: number | null;
  /** Set when super-admin pinned this salon in Featured salons. */
  is_featured?: boolean;
}

export interface ServiceCategory extends BaseEntity {
  name: string;
  description?: string;
  image_url?: string;
  branch_id?: string;
  status: Status;
}

export interface Service extends BaseEntity {
  title: string;
  description?: string;
  price: number;
  duration_minutes: number;
  category_id: string;
  branch_ids: string[];
  employee_ids: string[];
  image_url?: string;
  status: Status;
  /** Set when super-admin pinned this service in Popular catalog. */
  is_featured?: boolean;
}

export interface Employee extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  branch_id: string;
  service_ids: string[];
  image_url?: string;
  bio?: string;
  rating?: number;
  status: 'active' | 'inactive' | 'blocked';
}

export type BookingPhotoKind = 'before' | 'after';

export interface BookingPhoto extends BaseEntity {
  booking_id: string;
  kind: BookingPhotoKind;
  url: string;
  uploaded_by_user_id?: string | null;
  uploaded_by_role?: string | null;
}

export interface Booking extends BaseEntity {
  customer_email: string;
  customer_name: string;
  branch_id: string;
  branch_name: string;
  service_id: string;
  service_title: string;
  employee_id: string;
  employee_name: string;
  date: string;
  time_slot: string;
  duration_minutes: number;
  price: number;
  discount: number;
  final_price: number;
  coupon_code?: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  notes?: string;
  cancellation_reason?: string;
  /** Before/after visit photos (included when the API loads booking photos). */
  photos?: BookingPhoto[];
}

export interface Coupon extends BaseEntity {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order: number;
  max_uses?: number;
  used_count: number;
  expiry_date?: string;
  status: 'active' | 'inactive' | 'expired';
  branch_ids?: string[];
  category_ids?: string[];
  customer_emails?: string[];
}

export interface Package extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  service_ids: string[];
  branch_ids: string[];
  total_sessions: number;
  validity_days: number;
  image_url?: string;
  status: Status;
  /** Set when super-admin pinned this package in Popular catalog. */
  is_featured?: boolean;
}

export interface Notification extends BaseEntity {
  user_email?: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'reminder' | 'system' | 'announcement';
  read: boolean;
  reference_id?: string;
}

export interface Review extends BaseEntity {
  customer_email: string;
  customer_name: string;
  booking_id?: string;
  service_id?: string;
  employee_id?: string;
  branch_id?: string;
  rating: number;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  /** Joined from booking when listing reviews */
  service_title?: string;
  branch_name?: string;
  employee_name?: string;
  booking_date?: string;
}

export type PayoutStatus = 'pending' | 'paid' | 'cancelled';

export interface StaffPayout extends BaseEntity {
  employee_id: string;
  employee_name: string;
  branch_id?: string;
  amount: number;
  period_start: string;
  period_end: string;
  status: PayoutStatus;
  notes?: string;
}

export interface BookingChat extends BaseEntity {
  booking_id: string;
  customer_email: string;
  customer_name: string;
  branch_id: string;
  branch_name: string;
  service_title?: string;
  booking_date?: string;
  time_slot?: string;
  duration_minutes?: number;
  booking_status?: BookingStatus;
  payment_status?: PaymentStatus;
  final_price?: number;
  unread_customer?: number;
  unread_salon?: number;
}

export interface ChatMessage extends BaseEntity {
  chat_id: string;
  sender_role: 'customer' | 'salon';
  sender_name: string;
  body: string;
  read_by_customer: boolean;
  read_by_salon: boolean;
}

export interface StaffTimeOff extends BaseEntity {
  employee_id: string;
  employee_name?: string;
  start_date: string;
  end_date: string;
  /** NULL = full day off for each date in the range */
  start_time?: string | null;
  end_time?: string | null;
  reason?: string | null;
  created_by?: string | null;
}

export interface SalonRegistrationRequest extends BaseEntity {
  email: string;
  full_name: string;
  phone?: string;
  salon_name: string;
  salon_address: string;
  salon_city?: string;
  salon_phone?: string;
  salon_email?: string;
  salon_description?: string;
  opening_time?: string;
  closing_time?: string;
  status: SalonRequestStatus;
  reviewed_by?: string;
  review_notes?: string;
  reviewed_at?: string;
  branch_id?: string;
  owner_user_id?: string;
  /** Live branch status when `branch_id` is set (e.g. after approval). */
  branch_status?: BranchStatus;
}

export interface ActivityLog {
  id: string;
  branch_id?: string;
  branch_name?: string;
  actor_user_id?: string;
  actor_name?: string;
  actor_email?: string;
  actor_role?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}
