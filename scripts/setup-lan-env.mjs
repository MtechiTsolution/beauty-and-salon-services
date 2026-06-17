import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLocalIp } from './get-local-ip.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const ip = getLocalIp();

const customerEnv = `VITE_API_BASE_URL=/api
VITE_ADMIN_APP_URL=http://${ip}:5174
`;

const adminEnv = `VITE_API_BASE_URL=/api
VITE_CUSTOMER_APP_URL=http://${ip}:5173
`;

writeFileSync(path.join(root, 'customer', '.env.development.local'), customerEnv, 'utf8');
writeFileSync(path.join(root, 'admin', '.env.development.local'), adminEnv, 'utf8');

console.log('\nLAN dev environment ready.\n');
console.log(`  Customer app:  http://${ip}:5173`);
console.log(`  Admin app:     http://${ip}:5174`);
console.log(`  API (direct):  http://${ip}:3001/api`);
console.log('\nShare the Customer or Admin URL with devices on the same Wi‑Fi.\n');
console.log('Start services in separate terminals:');
console.log('  npm run dev:backend');
console.log('  npm run dev:customer');
console.log('  npm run dev:admin\n');
