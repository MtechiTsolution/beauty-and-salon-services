-- MIT Salon SaaS — run this in MySQL Workbench
-- 1. Create connection to localhost:3306
-- 2. File → Open SQL Script → select this file
-- 3. Execute (lightning icon)

CREATE DATABASE IF NOT EXISTS mit_salon
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mit_salon;

-- Users (admin + customers)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Branches
CREATE TABLE branches (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  image_url TEXT,
  description TEXT,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Service categories
CREATE TABLE service_categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Services
CREATE TABLE services (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  category_id VARCHAR(36) NOT NULL,
  image_url TEXT,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES service_categories(id)
);

-- Service ↔ Branch (many-to-many)
CREATE TABLE service_branches (
  service_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (service_id, branch_id),
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- Employees (staff)
CREATE TABLE employees (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role ENUM(
    'manager',
    'receptionist',
    'stylist',
    'threading_trimming',
    'hairdresser',
    'massage_expert'
  ) NOT NULL DEFAULT 'stylist',
  branch_id VARCHAR(36) NOT NULL,
  image_url TEXT,
  bio TEXT,
  rating DECIMAL(3, 2),
  status ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Employee ↔ Service (many-to-many)
CREATE TABLE employee_services (
  employee_id VARCHAR(36) NOT NULL,
  service_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (employee_id, service_id),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Bookings
CREATE TABLE bookings (
  id VARCHAR(36) PRIMARY KEY,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  branch_id VARCHAR(36) NOT NULL,
  branch_name VARCHAR(255) NOT NULL,
  service_id VARCHAR(36) NOT NULL,
  service_title VARCHAR(255) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  booking_date DATE NOT NULL,
  time_slot VARCHAR(10) NOT NULL,
  duration_minutes INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  final_price DECIMAL(10, 2) NOT NULL,
  coupon_code VARCHAR(50),
  status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'pending',
  payment_status ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
  payment_method VARCHAR(50),
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Coupons
CREATE TABLE coupons (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order DECIMAL(10, 2) DEFAULT 0,
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  expiry_date DATE,
  status ENUM('active', 'inactive', 'expired') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Packages
CREATE TABLE packages (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  total_sessions INT NOT NULL,
  validity_days INT NOT NULL,
  image_url TEXT,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_email VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('booking', 'payment', 'reminder', 'system') NOT NULL DEFAULT 'system',
  `read` TINYINT(1) NOT NULL DEFAULT 0,
  reference_id VARCHAR(36),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
  id VARCHAR(36) PRIMARY KEY,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  booking_id VARCHAR(36),
  service_id VARCHAR(36),
  employee_id VARCHAR(36),
  branch_id VARCHAR(36),
  rating INT NOT NULL,
  comment TEXT,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
