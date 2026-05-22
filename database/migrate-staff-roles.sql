-- Expand employee job roles (run once on existing databases)
USE mit_salon;

ALTER TABLE employees
  MODIFY COLUMN role ENUM(
    'manager',
    'receptionist',
    'stylist',
    'threading_trimming',
    'hairdresser',
    'massage_expert'
  ) NOT NULL DEFAULT 'stylist';
