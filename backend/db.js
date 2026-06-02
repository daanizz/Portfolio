const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'portfolio.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Create Tables ──────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL DEFAULT 'Your Name',
    tagline TEXT NOT NULL DEFAULT 'Developer & Designer',
    bio TEXT NOT NULL DEFAULT 'Write something about yourself.',
    email TEXT NOT NULL DEFAULT 'hello@example.com',
    avatar_url TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    group_name TEXT DEFAULT 'General',
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS socials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS category_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    link TEXT DEFAULT '',
    date TEXT DEFAULT '',
    body TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );
`);

// ── Migrations ─────────────────────────────────────────────────────────────────

try {
    db.prepare('ALTER TABLE profile ADD COLUMN avatar_url TEXT DEFAULT ""').run();
} catch (err) {
    // Ignore error if column already exists
}

// ── Seed Default Profile ───────────────────────────────────────────────────────

const profileExists = db.prepare('SELECT COUNT(*) as count FROM profile').get();
if (profileExists.count === 0) {
    db.prepare(`
    INSERT INTO profile (id, name, tagline, bio, email)
    VALUES (1, 'Your Name', 'Developer & Designer', 'Write something about yourself here. This section supports **markdown** formatting.', 'hello@example.com')
  `).run();
}

module.exports = db;
