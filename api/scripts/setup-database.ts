import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { dbConfig } from '../src/db.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '../../database/schema.sql');

async function main() {
  if (!dbConfig.password) {
    console.error('❌ Set DB_PASSWORD in api/.env (your MySQL root password) then run: npm run db:setup -w mit-salon-api');
    process.exit(1);
  }

  console.log('Connecting to MySQL...');
  const conn = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true,
  });

  const schema = fs.readFileSync(schemaPath, 'utf8');
  console.log('Running schema.sql...');
  await conn.query(schema);

  await conn.changeUser({ database: dbConfig.database });

  const [countRows] = await conn.query<mysql.RowDataPacket[]>(
    'SELECT COUNT(*) as c FROM users',
  );
  if (Number(countRows[0].c) > 0) {
    console.log('Database already has data — skipping seed.');
    console.log('   To re-seed, drop database mit_salon in Workbench and run db:setup again.');
    await conn.end();
    return;
  }

  console.log('Seeding demo data...');
  const hash = await bcrypt.hash('password', 10);
  const adminId = '00000000-0000-0000-0000-000000000001';
  const customerId = '00000000-0000-0000-0000-000000000002';
  const catHair = '00000000-0000-0000-0000-000000000020';
  const catSpa = '00000000-0000-0000-0000-000000000021';
  const branch1 = '00000000-0000-0000-0000-000000000010';
  const branch2 = '00000000-0000-0000-0000-000000000011';
  const svc1 = '00000000-0000-0000-0000-000000000030';
  const svc2 = '00000000-0000-0000-0000-000000000031';
  const emp1 = '00000000-0000-0000-0000-000000000040';
  const emp2 = '00000000-0000-0000-0000-000000000041';

  await conn.query(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES
     (?, 'admin@mitsalon.com', ?, 'Admin User', '+1 555 0100', 'admin'),
     (?, 'customer@example.com', ?, 'Jane Customer', '+1 555 0200', 'customer')`,
    [adminId, hash, customerId, hash],
  );

  await conn.query(
    `INSERT INTO service_categories (id, name, description, status) VALUES
     (?, 'Hair', 'Cuts and color', 'active'),
     (?, 'Spa', 'Facials and wellness', 'active')`,
    [catHair, catSpa],
  );

  const branchImg1 = 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=500&fit=crop';
  const branchImg2 = 'https://images.unsplash.com/photo-1633681926022-84c23e8cb04d?w=800&h=500&fit=crop';
  const svcImg1 = 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=500&fit=crop';
  const svcImg2 = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=500&fit=crop';

  await conn.query(
    `INSERT INTO branches (id, name, address, city, phone, email, image_url, status) VALUES
     (?, 'MIT Salon Downtown', '123 Main Street', 'New York, NY', '+1 555 1001', 'downtown@mitsalon.com', ?, 'active'),
     (?, 'MIT Salon Uptown', '456 Park Avenue', 'New York, NY', '+1 555 1002', 'uptown@mitsalon.com', ?, 'active')`,
    [branch1, branchImg1, branch2, branchImg2],
  );

  await conn.query(
    `INSERT INTO services (id, title, description, price, duration_minutes, category_id, image_url, status) VALUES
     (?, 'Premium Haircut', 'Wash, cut, and blow-dry', 65, 60, ?, ?, 'active'),
     (?, 'Relaxing Facial', 'Deep cleanse and mask', 95, 75, ?, ?, 'active')`,
    [svc1, catHair, svcImg1, svc2, catSpa, svcImg2],
  );

  await conn.query(
    `INSERT INTO service_branches (service_id, branch_id) VALUES (?, ?), (?, ?), (?, ?), (?, ?)`,
    [svc1, branch1, svc1, branch2, svc2, branch1, svc2, branch2],
  );

  await conn.query(
    `INSERT INTO employees (id, name, email, role, branch_id, rating, status) VALUES
     (?, 'Sarah Mitchell', 'sarah@mitsalon.com', 'stylist', ?, 4.9, 'active'),
     (?, 'Alex Rivera', 'alex@mitsalon.com', 'stylist', ?, 4.7, 'active')`,
    [emp1, branch1, emp2, branch2],
  );

  await conn.query(
    `INSERT INTO employee_services (employee_id, service_id) VALUES (?, ?), (?, ?)`,
    [emp1, svc1, emp2, svc1],
  );

  await conn.query(
    `INSERT INTO coupons (id, code, discount_type, discount_value, min_order, used_count, status) VALUES
     ('00000000-0000-0000-0000-000000000050', 'WELCOME10', 'percentage', 10, 0, 0, 'active')`,
  );

  console.log('✅ Database ready: mit_salon');
  console.log('   Demo logins (password: password):');
  console.log('   - admin@mitsalon.com');
  console.log('   - customer@example.com');
  await conn.end();
}

main().catch((e) => {
  console.error('Setup failed:', e.message);
  process.exit(1);
});
