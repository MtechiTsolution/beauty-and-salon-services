export const APP_NAME = 'MIT Salon';

export const SALON_SUPPORT = {
  phone: '+1 (555) 123-4567',
  email: 'hello@mitsalon.com',
  hours: 'Mon–Sat 9:00 AM – 7:00 PM · Sun 10:00 AM – 5:00 PM',
} as const;

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00',
];

export const BOOKING_STEPS = ['Branch', 'Service or package', 'Staff', 'Date & Time', 'Payment', 'Confirm'] as const;

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', description: 'Pay securely online (mock)' },
  { id: 'wallet', label: 'Mobile Wallet', description: 'Apple Pay, Google Pay (mock)' },
  { id: 'cash', label: 'Pay at Salon', description: 'Pay when you arrive' },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id'];
