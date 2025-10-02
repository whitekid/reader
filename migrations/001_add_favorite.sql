-- Migration: Add favorite feature
-- Run: wrangler d1 execute reader --file=migrations/001_add_favorite.sql

-- Add is_favorite column to articles table
ALTER TABLE articles ADD COLUMN is_favorite INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_is_favorite ON articles(is_favorite);
CREATE INDEX IF NOT EXISTS idx_favorite_created ON articles(is_favorite, created_at DESC);
