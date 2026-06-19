import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      subscription_plan_id TEXT,
      is_premium INTEGER DEFAULT 0,
      has_seen_welcome INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    db.exec('ALTER TABLE users ADD COLUMN has_seen_welcome INTEGER DEFAULT 0');
  } catch (e) {
    // Column might already exist
  }

  db.exec(`

    CREATE TABLE IF NOT EXISTS used_coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      coupon_code TEXT,
      wheel_version INTEGER,
      consumed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, wheel_version)
    );

    CREATE TABLE IF NOT EXISTS user_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      file_name TEXT,
      tool_used TEXT,
      execution_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      cloud_link TEXT
    );
  `);
  
  // Insert a mock user for testing
  try {
    db.prepare('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)').run('user_123', 'Test User', 'test@example.com', 'hashed_password');
  } catch (e) {
    // Ignore if exists
  }
}

export function upgradeUserPlan(userId: string, planId: string) {
  const stmt = db.prepare('UPDATE users SET subscription_plan_id = ?, is_premium = 1 WHERE id = ?');
  return stmt.run(planId, userId);
}

export function burnCoupon(userId: string, couponCode: string, wheelVersion: number) {
  const stmt = db.prepare('INSERT INTO used_coupons (user_id, coupon_code, wheel_version) VALUES (?, ?, ?)');
  return stmt.run(userId, couponCode, wheelVersion);
}

export function hasUserBurnedCoupon(userId: string, wheelVersion: number) {
  const stmt = db.prepare('SELECT 1 FROM used_coupons WHERE user_id = ? AND wheel_version = ?');
  return stmt.get(userId, wheelVersion) !== undefined;
}

export function saveToHistory(userId: string, fileName: string, toolUsed: string, cloudLink: string) {
  const stmt = db.prepare('INSERT INTO user_activity (user_id, file_name, tool_used, cloud_link) VALUES (?, ?, ?, ?)');
  return stmt.run(userId, fileName, toolUsed, cloudLink);
}

export function fetchUserHistory(userId: string, limit?: number) {
  let query = 'SELECT * FROM user_activity WHERE user_id = ? ORDER BY execution_time DESC';
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  const stmt = db.prepare(query);
  return stmt.all(userId);
}

export default db;
