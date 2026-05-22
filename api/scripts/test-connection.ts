import dotenv from 'dotenv';
import { testConnection, dbConfig } from '../src/db.js';

dotenv.config();

async function main() {
  console.log(`Testing MySQL at ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}...`);
  if (!dbConfig.password) {
    console.error('\n❌ DB_PASSWORD is empty. Edit api/.env and set your MySQL root password.\n');
    process.exit(1);
  }
  try {
    await testConnection();
    console.log('✅ MySQL connection successful!\n');
  } catch (e) {
    console.error('❌ Connection failed:', e instanceof Error ? e.message : e);
    console.error('\nCheck api/.env — DB_USER and DB_PASSWORD must match MySQL Workbench.\n');
    process.exit(1);
  }
}

main();
