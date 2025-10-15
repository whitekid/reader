-- Migration: Add indexes for cursor-based pagination
-- Run: wrangler d1 execute reader --file=migrations/002_add_pagination_indexes.sql

-- Create composite indexes for efficient cursor-based pagination
-- Used by: getAllArticlesPaginated, getUnreadArticlesPaginated, getFavoriteArticlesPaginated

-- For all articles view (ORDER BY created_at DESC, id DESC)
CREATE INDEX IF NOT EXISTS idx_created_id ON articles(created_at DESC, id DESC);

-- For unread articles view (WHERE is_read = 0 ORDER BY created_at DESC, id DESC)
CREATE INDEX IF NOT EXISTS idx_unread_created_id ON articles(is_read, created_at DESC, id DESC);

-- For favorite articles view (WHERE is_favorite = 1 ORDER BY created_at DESC, id DESC)
CREATE INDEX IF NOT EXISTS idx_favorite_created_id ON articles(is_favorite, created_at DESC, id DESC);
