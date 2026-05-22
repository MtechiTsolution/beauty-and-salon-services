-- Run after schema.sql (safe to re-run)
USE mit_salon;

CREATE TABLE IF NOT EXISTS package_services (
  package_id VARCHAR(36) NOT NULL,
  service_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (package_id, service_id),
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS package_branches (
  package_id VARCHAR(36) NOT NULL,
  branch_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (package_id, branch_id),
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff_payouts (
  id VARCHAR(36) PRIMARY KEY,
  employee_id VARCHAR(36) NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  branch_id VARCHAR(36),
  amount DECIMAL(10, 2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status ENUM('pending', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);
