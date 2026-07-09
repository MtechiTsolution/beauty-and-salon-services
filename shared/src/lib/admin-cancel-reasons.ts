export type AdminCancelPreset = {
  id: string;
  label: string;
  reason: string;
};

export const ADMIN_CANCEL_PRESETS: AdminCancelPreset[] = [
  {
    id: 'staff_unavailable',
    label: 'Staff unavailable',
    reason:
      'Your stylist is unavailable for this appointment. We apologize for the inconvenience — please book another time.',
  },
  {
    id: 'staff_sick',
    label: 'Staff sick / emergency',
    reason:
      'Your stylist is unexpectedly unavailable due to illness or an emergency. Please reschedule at your convenience.',
  },
  {
    id: 'salon_closed',
    label: 'Salon closed',
    reason: 'We are unable to honor this appointment because the salon is closed. Please choose a new date.',
  },
  {
    id: 'customer_reschedule',
    label: 'Customer requested reschedule',
    reason: 'Cancelled at your request so you can book a new time that works better for you.',
  },
  {
    id: 'double_booked',
    label: 'Scheduling conflict',
    reason: 'This slot was affected by a scheduling conflict. Please book another available time.',
  },
];
