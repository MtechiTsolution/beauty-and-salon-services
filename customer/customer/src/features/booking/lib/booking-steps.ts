/** Customer booking step labels (first step uses "Saloon" instead of "Branch"). */

export const CUSTOMER_BOOKING_STEPS = [
  { full: 'Saloon', short: 'Saloon', micro: 'Salon' },
  { full: 'Service or package', short: 'Offering', micro: 'Offer' },
  { full: 'Staff', short: 'Staff', micro: 'Staff' },
  { full: 'Date & Time', short: 'Schedule', micro: 'Time' },
  { full: 'Payment', short: 'Payment', micro: 'Pay' },
  { full: 'Confirm', short: 'Confirm', micro: 'Done' },
] as const;



export const CUSTOMER_BOOKING_STEP_LABELS = CUSTOMER_BOOKING_STEPS.map((s) => s.full);


