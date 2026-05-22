/**
 * Adds full branch/service catalog to MySQL (8 branches, services, staff).
 * Safe to re-run — uses INSERT IGNORE / skips existing names.
 * Run: npm run db:seed-full -w mit-salon-api
 */
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import { dbConfig } from '../src/db.js';

dotenv.config();

const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop`;
const B_IMG = [px(3992876), px(1319460), px(3998404), px(3065209), px(1991583), px(6813355), px(8528747), px(3738347)];
const S_IMG = [
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1605499978939-294694c68ad6?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1527799820374-dcf8d9a73791?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1519494020750-54eec2f9a798?w=800&h=500&fit=crop',
];

const BRANCHES = [
  { name: 'MIT Salon Downtown', address: '123 Main Street', city: 'New York, NY', phone: '+1 555 1001', email: 'downtown@mitsalon.com', image: B_IMG[0], desc: 'Flagship location with full spa, hair, and nail services.' },
  { name: 'MIT Salon Uptown', address: '456 Park Avenue', city: 'New York, NY', phone: '+1 555 1002', email: 'uptown@mitsalon.com', image: B_IMG[1], desc: 'Boutique salon specializing in color and styling.' },
  { name: 'MIT Salon Brooklyn', address: '89 Atlantic Avenue', city: 'Brooklyn, NY', phone: '+1 555 1003', email: 'brooklyn@mitsalon.com', image: B_IMG[2], desc: 'Trendy loft space with expert colorists and barbers.' },
  { name: 'MIT Salon Jersey City', address: '200 Grove Street', city: 'Jersey City, NJ', phone: '+1 555 1004', email: 'jersey@mitsalon.com', image: B_IMG[3], desc: 'Modern salon with skyline views and premium treatments.' },
  { name: 'MIT Salon Queens', address: '37-12 Steinway Street', city: 'Queens, NY', phone: '+1 555 1005', email: 'queens@mitsalon.com', image: B_IMG[4], desc: 'Family-friendly location with bridal and event styling.' },
  { name: 'MIT Salon Westchester', address: '1 Post Road', city: 'Scarsdale, NY', phone: '+1 555 1006', email: 'westchester@mitsalon.com', image: B_IMG[5], desc: 'Luxury suburban retreat for spa and wellness services.' },
  { name: 'MIT Salon Hoboken', address: '500 Washington Street', city: 'Hoboken, NJ', phone: '+1 555 1007', email: 'hoboken@mitsalon.com', image: B_IMG[6], desc: 'Compact urban studio for quick cuts and express services.' },
  { name: 'MIT Salon Long Island', address: '1200 Northern Boulevard', city: 'Manhasset, NY', phone: '+1 555 1008', email: 'longisland@mitsalon.com', image: B_IMG[7], desc: 'Spacious salon with private suites and bridal lounge.' },
];

const SERVICES = [
  { title: 'Premium Haircut', price: 65, mins: 60, img: S_IMG[0], desc: 'Wash, cut, and blow-dry' },
  { title: 'Balayage Color', price: 180, mins: 150, img: S_IMG[1], desc: 'Hand-painted highlights' },
  { title: 'Relaxing Facial', price: 95, mins: 75, img: S_IMG[2], desc: 'Deep cleanse and hydrating mask' },
  { title: 'Gel Manicure', price: 45, mins: 45, img: S_IMG[3], desc: 'Long-lasting gel polish' },
  { title: 'Swedish Massage', price: 110, mins: 60, img: S_IMG[4], desc: 'Full-body relaxation' },
  { title: 'Keratin Treatment', price: 250, mins: 180, img: S_IMG[5], desc: 'Smooth, frizz-free hair' },
  { title: "Men's Grooming", price: 55, mins: 45, img: S_IMG[6], desc: 'Cut, beard trim, hot towel' },
  { title: 'Luxury Blowout', price: 50, mins: 40, img: S_IMG[7], desc: 'Volume and shine finish' },
];

async function main() {
  const conn = await mysql.createConnection({ ...dbConfig });
  let catId = randomUUID();
  const [cats] = await conn.query<mysql.RowDataPacket[]>('SELECT id FROM service_categories LIMIT 1');
  if (cats[0]) catId = cats[0].id as string;
  else {
    await conn.query(
      'INSERT INTO service_categories (id, name, description, status) VALUES (?, ?, ?, ?)',
      [catId, 'Hair & Beauty', 'Salon services', 'active'],
    );
  }

  const branchIds: string[] = [];
  for (const b of BRANCHES) {
    const [existing] = await conn.query<mysql.RowDataPacket[]>(
      'SELECT id FROM branches WHERE name = ?',
      [b.name],
    );
    let id = existing[0]?.id as string | undefined;
    if (!id) {
      id = randomUUID();
      await conn.query(
        `INSERT INTO branches (id, name, address, city, phone, email, image_url, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [id, b.name, b.address, b.city, b.phone, b.email, b.image, b.desc],
      );
      console.log('Added branch:', b.name);
    } else {
      await conn.query(
        'UPDATE branches SET image_url = ?, description = ? WHERE id = ?',
        [b.image, b.desc, id],
      );
    }
    branchIds.push(id!);
  }

  const serviceIds: string[] = [];
  for (const s of SERVICES) {
    const [existing] = await conn.query<mysql.RowDataPacket[]>(
      'SELECT id FROM services WHERE title = ?',
      [s.title],
    );
    let id = existing[0]?.id as string | undefined;
    if (!id) {
      id = randomUUID();
      await conn.query(
        `INSERT INTO services (id, title, description, price, duration_minutes, category_id, image_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
        [id, s.title, s.desc, s.price, s.mins, catId, s.img],
      );
      console.log('Added service:', s.title);
    } else {
      await conn.query('UPDATE services SET image_url = ? WHERE id = ?', [s.img, id]);
    }
    serviceIds.push(id!);
    for (const bid of branchIds) {
      await conn.query('INSERT IGNORE INTO service_branches (service_id, branch_id) VALUES (?, ?)', [id, bid]);
    }
  }

  const stylistNames = [
    ['Sarah Mitchell', 'sarah@mitsalon.com', 4.9],
    ['Alex Rivera', 'alex@mitsalon.com', 4.7],
    ['Jordan Lee', 'jordan@mitsalon.com', 4.8],
    ['Mia Chen', 'mia@mitsalon.com', 4.9],
    ['Chris Taylor', 'chris@mitsalon.com', 4.6],
    ['Emma Wilson', 'emma@mitsalon.com', 4.8],
    ['David Park', 'david@mitsalon.com', 4.7],
    ['Olivia Brown', 'olivia@mitsalon.com', 4.9],
  ];

  const PACKAGES = [
    { name: 'Hair Care Bundle', desc: '3 premium haircuts', price: 170, sessions: 3, days: 90, services: [0] },
    { name: 'Spa Day Package', desc: 'Facial + massage combo', price: 185, sessions: 2, days: 60, services: [2, 4] },
    { name: 'Bridal Bliss', desc: 'Trial + wedding day styling', price: 599, sessions: 2, days: 180, services: [6] },
  ];
  for (const pkg of PACKAGES) {
    const [existing] = await conn.query<mysql.RowDataPacket[]>(
      'SELECT id FROM packages WHERE name = ?',
      [pkg.name],
    );
    let pkgId = existing[0]?.id as string | undefined;
    if (!pkgId) {
      pkgId = randomUUID();
      await conn.query(
        `INSERT INTO packages (id, name, description, price, total_sessions, validity_days, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [pkgId, pkg.name, pkg.desc, pkg.price, pkg.sessions, pkg.days],
      );
      console.log('Added package:', pkg.name);
    }
    for (const si of pkg.services) {
      const sid = serviceIds[si];
      if (sid) {
        await conn.query('INSERT IGNORE INTO package_services (package_id, service_id) VALUES (?, ?)', [
          pkgId,
          sid,
        ]);
      }
    }
    for (const bid of branchIds) {
      await conn.query('INSERT IGNORE INTO package_branches (package_id, branch_id) VALUES (?, ?)', [
        pkgId,
        bid,
      ]);
    }
  }

  for (let i = 0; i < branchIds.length; i++) {
    const [n, email, rating] = stylistNames[i % stylistNames.length];
    const [existing] = await conn.query<mysql.RowDataPacket[]>(
      'SELECT id FROM employees WHERE email = ?',
      [email],
    );
    let empId = existing[0]?.id as string | undefined;
    if (!empId) {
      empId = randomUUID();
      await conn.query(
        `INSERT INTO employees (id, name, email, role, branch_id, rating, status)
         VALUES (?, ?, ?, 'stylist', ?, ?, 'active')`,
        [empId, n, email, branchIds[i], rating],
      );
      console.log('Added stylist:', n, 'at branch', i + 1);
    }
    const svcId = serviceIds[i % serviceIds.length];
    await conn.query('INSERT IGNORE INTO employee_services (employee_id, service_id) VALUES (?, ?)', [empId, svcId]);
    if (serviceIds[0]) {
      await conn.query('INSERT IGNORE INTO employee_services (employee_id, service_id) VALUES (?, ?)', [empId, serviceIds[0]]);
    }
  }

  await conn.end();
  console.log('✅ Full catalog seed complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
