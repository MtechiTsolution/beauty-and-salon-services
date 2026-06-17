import { getPool } from '../db.js';

/** Ensures notifications.type accepts salon announcements (safe to re-run). */
export async function ensureNotificationAnnouncementType(): Promise<void> {
  const pool = getPool();
  const [rows] = await pool.query<{ Field: string; Type: string }[]>(
    `SHOW COLUMNS FROM notifications LIKE 'type'`,
  );

  const column = rows[0];
  if (!column) return;

  if (column.Type.includes('announcement')) return;

  await pool.query(`
    ALTER TABLE notifications
      MODIFY COLUMN type ENUM('booking', 'payment', 'reminder', 'system', 'announcement') NOT NULL DEFAULT 'system'
  `);
}

/** Categories are scoped to a single saloon (branch). */
export async function ensureCategoryBranchScope(): Promise<void> {
  const pool = getPool();
  const [rows] = await pool.query<{ Field: string }[]>(
    `SHOW COLUMNS FROM service_categories LIKE 'branch_id'`,
  );

  if (!rows[0]) {
    await pool.query(`
      ALTER TABLE service_categories
        ADD COLUMN branch_id VARCHAR(36) NULL AFTER image_url
    `);
  }

  await pool.query(`
    UPDATE service_categories c
    SET branch_id = (
      SELECT b.id FROM branches b WHERE b.status = 'active' ORDER BY b.name LIMIT 1
    )
    WHERE c.branch_id IS NULL
  `);
}

export async function ensureSchema(): Promise<void> {
  await ensureNotificationAnnouncementType();
  await ensureCategoryBranchScope();
}
