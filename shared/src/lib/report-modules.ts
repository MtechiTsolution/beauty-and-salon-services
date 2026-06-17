export type ReportModule =
  | 'bookings'
  | 'customers'
  | 'reviews'
  | 'payouts'
  | 'branches'
  | 'categories'
  | 'services'
  | 'packages'
  | 'staff'
  | 'coupons'
  | 'notifications';

export type ReportColumnDef = { key: string; header: string };

export type ReportModuleMeta = {
  id: ReportModule;
  label: string;
  description: string;
  columns: ReportColumnDef[];
  /** Supports from/to date filter on export */
  dateFilter?: 'booking_date' | 'created_at' | 'period';
};

export const REPORT_MODULES: ReportModuleMeta[] = [
  {
    id: 'bookings',
    label: 'Bookings',
    description: 'Appointments, revenue, status, and payment details',
    dateFilter: 'booking_date',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'customer_name', header: 'Customer name' },
      { key: 'customer_email', header: 'Customer email' },
      { key: 'branch_name', header: 'Saloon' },
      { key: 'service_title', header: 'Service' },
      { key: 'employee_name', header: 'Stylist' },
      { key: 'date', header: 'Date' },
      { key: 'time_slot', header: 'Time' },
      { key: 'duration_minutes', header: 'Duration (min)' },
      { key: 'price', header: 'Price' },
      { key: 'discount', header: 'Discount' },
      { key: 'final_price', header: 'Final price' },
      { key: 'coupon_code', header: 'Coupon' },
      { key: 'status', header: 'Status' },
      { key: 'payment_status', header: 'Payment status' },
      { key: 'payment_method', header: 'Payment method' },
      { key: 'notes', header: 'Notes' },
      { key: 'created_at', header: 'Created at' },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    description: 'Registered customers and booking activity',
    dateFilter: 'created_at',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'full_name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'booking_count', header: 'Total bookings' },
      { key: 'paid_total', header: 'Paid total ($)' },
      { key: 'created_at', header: 'Registered at' },
    ],
  },
  {
    id: 'reviews',
    label: 'Reviews',
    description: 'Customer ratings and feedback',
    dateFilter: 'created_at',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'customer_name', header: 'Customer' },
      { key: 'customer_email', header: 'Email' },
      { key: 'rating', header: 'Rating' },
      { key: 'comment', header: 'Comment' },
      { key: 'status', header: 'Status' },
      { key: 'booking_id', header: 'Booking ID' },
      { key: 'created_at', header: 'Created at' },
    ],
  },
  {
    id: 'payouts',
    label: 'Payouts',
    description: 'Staff payout records by period',
    dateFilter: 'period',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'employee_name', header: 'Staff' },
      { key: 'amount', header: 'Amount' },
      { key: 'period_start', header: 'Period start' },
      { key: 'period_end', header: 'Period end' },
      { key: 'status', header: 'Status' },
      { key: 'notes', header: 'Notes' },
      { key: 'created_at', header: 'Created at' },
    ],
  },
  {
    id: 'branches',
    label: 'Saloons',
    description: 'Salon locations',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'address', header: 'Address' },
      { key: 'city', header: 'City' },
      { key: 'phone', header: 'Phone' },
      { key: 'email', header: 'Email' },
      { key: 'status', header: 'Status' },
      { key: 'created_at', header: 'Created at' },
    ],
  },
  {
    id: 'categories',
    label: 'Categories',
    description: 'Service categories',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'description', header: 'Description' },
      { key: 'status', header: 'Status' },
      { key: 'created_at', header: 'Created at' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    description: 'Services, pricing, and catalog links',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'title', header: 'Title' },
      { key: 'description', header: 'Description' },
      { key: 'price', header: 'Price' },
      { key: 'duration_minutes', header: 'Duration (min)' },
      { key: 'category_id', header: 'Category ID' },
      { key: 'branch_ids', header: 'Saloon IDs' },
      { key: 'status', header: 'Status' },
      { key: 'created_at', header: 'Created at' },
    ],
  },
  {
    id: 'packages',
    label: 'Packages',
    description: 'Service bundles and sessions',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'description', header: 'Description' },
      { key: 'price', header: 'Price' },
      { key: 'total_sessions', header: 'Sessions' },
      { key: 'validity_days', header: 'Validity (days)' },
      { key: 'service_ids', header: 'Service IDs' },
      { key: 'branch_ids', header: 'Saloon IDs' },
      { key: 'status', header: 'Status' },
      { key: 'created_at', header: 'Created at' },
    ],
  },
  {
    id: 'staff',
    label: 'Staff',
    description: 'Employees and stylists',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'role', header: 'Role' },
      { key: 'branch_id', header: 'Saloon ID' },
      { key: 'service_ids', header: 'Service IDs' },
      { key: 'rating', header: 'Rating' },
      { key: 'status', header: 'Status' },
      { key: 'created_at', header: 'Created at' },
    ],
  },
  {
    id: 'coupons',
    label: 'Coupons',
    description: 'Discount codes and usage',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'code', header: 'Code' },
      { key: 'discount_type', header: 'Discount type' },
      { key: 'discount_value', header: 'Discount value' },
      { key: 'min_order', header: 'Min order' },
      { key: 'max_uses', header: 'Max uses' },
      { key: 'used_count', header: 'Used count' },
      { key: 'expiry_date', header: 'Expiry date' },
      { key: 'status', header: 'Status' },
      { key: 'created_at', header: 'Created at' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'System and booking alerts',
    dateFilter: 'created_at',
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'title', header: 'Title' },
      { key: 'message', header: 'Message' },
      { key: 'type', header: 'Type' },
      { key: 'user_email', header: 'User email' },
      { key: 'read', header: 'Read' },
      { key: 'reference_id', header: 'Reference ID' },
      { key: 'created_at', header: 'Created at' },
    ],
  },
];

export function getReportModule(id: ReportModule): ReportModuleMeta {
  const m = REPORT_MODULES.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown report module: ${id}`);
  return m;
}
