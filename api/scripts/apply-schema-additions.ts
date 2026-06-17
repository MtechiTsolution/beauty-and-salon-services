import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { dbConfig } from '../src/db.js';

dotenv.config();

async function main() {
  const sqlPath = path.join(process.cwd(), '..', 'database', 'schema-additions.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const conn = await mysql.createConnection({ ...dbConfig, multipleStatements: true });
  await conn.query(sql);
  await conn.end();
  console.log('Schema additions applied (package_services, package_branches, staff_payouts, notification announcements).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
