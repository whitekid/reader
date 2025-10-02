-- D1 Database Schema for Reader
-- Run: wrangler d1 execute reader --file=migrations/000_initial_schema.sql

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT,              -- Extracted article content (HTML)
  excerpt TEXT,              -- Summary/preview (max 300 chars)
  author TEXT,
  site_name TEXT,
  published_time DATETIME,
  word_count INTEGER,
  reading_time INTEGER,      -- Estimated reading time in minutes
  is_read INTEGER DEFAULT 0, -- 0: unread, 1: read
  is_favorite INTEGER DEFAULT 0, -- 0: normal, 1: favorite
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME           -- Timestamp when marked as read
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_is_read ON articles(is_read);
CREATE INDEX IF NOT EXISTS idx_is_favorite ON articles(is_favorite);
CREATE INDEX IF NOT EXISTS idx_favorite_created ON articles(is_favorite, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_created_at ON articles(created_at DESC);

-- Future extension: Tags
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS article_tags (
  article_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
