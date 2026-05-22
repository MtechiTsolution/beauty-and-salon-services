import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { dbConfig } from '../src/db.js';

dotenv.config();

async function main() {
  const conn = await mysql.createConnection({ ...dbConfig });
  const svc1 = '00000000-0000-0000-0000-000000000030';
  const svc2 = '00000000-0000-0000-0000-000000000031';
  const branch1 = '00000000-0000-0000-0000-000000000010';
  const branch2 = '00000000-0000-0000-0000-000000000011';
  const emp1 = '00000000-0000-0000-0000-000000000040';
  const emp2 = '00000000-0000-0000-0000-000000000041';

  await conn.query(
    'INSERT IGNORE INTO service_branches (service_id, branch_id) VALUES (?, ?), (?, ?), (?, ?), (?, ?)',
    [svc1, branch1, svc1, branch2, svc2, branch1, svc2, branch2],
  );
  await conn.query(
    `INSERT IGNORE INTO employees (id, name, email, role, branch_id, rating, status) VALUES
     (?, 'Sarah Mitchell', 'sarah@mitsalon.com', 'stylist', ?, 4.9, 'active'),
     (?, 'Alex Rivera', 'alex@mitsalon.com', 'stylist', ?, 4.7, 'active')`,
    [emp1, branch1, emp2, branch2],
  );
  await conn.query(
    'INSERT IGNORE INTO employee_services (employee_id, service_id) VALUES (?, ?), (?, ?)',
    [emp1, svc1, emp2, svc1],
  );
  await conn.query(
    `INSERT IGNORE INTO coupons (id, code, discount_type, discount_value, min_order, used_count, status)
     VALUES ('00000000-0000-0000-0000-000000000050', 'WELCOME10', 'percentage', 10, 0, 0, 'active')`,
  );
  console.log('✅ Partial seed fixed');
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
