/**

 * Assign one unique image_url per branch (by name) and per service (by title).

 * Run: npm run db:update-images

 */

import dotenv from 'dotenv';

import mysql from 'mysql2/promise';

import { dbConfig } from '../src/db.js';



dotenv.config();



const pexels = (id: number) =>

  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop`;



/** Must match packages/shared/src/lib/images.ts BRANCH_IMAGE_BY_NAME */

const BRANCH_IMAGE_BY_NAME: Record<string, string> = {

  'MIT Salon Downtown': pexels(3992876),

  'MIT Salon Uptown': pexels(1319460),

  'MIT Salon Brooklyn': pexels(3998404),

  'MIT Salon Jersey City': pexels(3065209),

  'MIT Salon Queens': pexels(1991583),

  'MIT Salon Westchester': pexels(6813355),

  'MIT Salon Hoboken': pexels(8528747),

  'MIT Salon Long Island': pexels(3738347),

};



const SERVICE_IMAGE_BY_TITLE: Record<string, string> = {

  'Premium Haircut': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&h=600&fit=crop&q=80',

  'Balayage Color': 'https://images.unsplash.com/photo-1605499978939-294694c68ad6?w=900&h=600&fit=crop',

  'Relaxing Facial': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&h=600&fit=crop',

  'Gel Manicure': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&h=600&fit=crop',

  'Swedish Massage': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&h=600&fit=crop',

  'Keratin Treatment': 'https://images.unsplash.com/photo-1527799820374-dcf8d9a73791?w=900&h=600&fit=crop',

  "Men's Grooming": 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&h=600&fit=crop',

  'Luxury Blowout': 'https://images.unsplash.com/photo-1519494020750-54eec2f9a798?w=900&h=600&fit=crop',

};



const BRANCH_POOL = Object.values(BRANCH_IMAGE_BY_NAME);

const SERVICE_POOL = Object.values(SERVICE_IMAGE_BY_TITLE);



async function main() {

  const conn = await mysql.createConnection({ ...dbConfig });



  const [branches] = await conn.query<mysql.RowDataPacket[]>(

    'SELECT id, name FROM branches ORDER BY name',

  );

  const usedBranchUrls = new Set<string>();

  for (const row of branches) {

    const name = row.name as string;

    let url = BRANCH_IMAGE_BY_NAME[name];

    if (!url) {

      url = BRANCH_POOL.find((u) => !usedBranchUrls.has(u)) ?? BRANCH_POOL[0];

    }

    usedBranchUrls.add(url);

    await conn.query('UPDATE branches SET image_url = ? WHERE id = ?', [url, row.id]);

    console.log(`Branch: ${name}`);

  }

  console.log(`Updated ${branches.length} branches (each unique URL)`);



  const [services] = await conn.query<mysql.RowDataPacket[]>(

    'SELECT id, title FROM services ORDER BY title',

  );

  const usedServiceUrls = new Set<string>();

  for (const row of services) {

    const title = row.title as string;

    let url = SERVICE_IMAGE_BY_TITLE[title];

    if (!url) {

      url = SERVICE_POOL.find((u) => !usedServiceUrls.has(u)) ?? SERVICE_POOL[0];

    }

    usedServiceUrls.add(url);

    await conn.query('UPDATE services SET image_url = ? WHERE id = ?', [url, row.id]);

  }

  console.log(`Updated ${services.length} services`);



  await conn.end();

  console.log('Done — hard refresh the customer app (Ctrl+Shift+R).');

}



main().catch((e) => {

  console.error(e);

  process.exit(1);

});


