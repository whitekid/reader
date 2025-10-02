/**
 * Article service for D1 database operations
 * Handles CRUD operations for articles
 */

import type { Article, ExtractedContent } from '../types.js';

export async function getArticle(db: D1Database, id: number): Promise<Article | null> {
  const result = await db
    .prepare('SELECT * FROM articles WHERE id = ?')
    .bind(id)
    .first<Article>();

  return result || null;
}

export async function getArticleByUrl(db: D1Database, url: string): Promise<Article | null> {
  const result = await db
    .prepare('SELECT * FROM articles WHERE url = ?')
    .bind(url)
    .first<Article>();

  return result || null;
}

export async function getUnreadArticles(db: D1Database, limit = 50): Promise<Article[]> {
  const result = await db
    .prepare('SELECT * FROM articles WHERE is_read = 0 ORDER BY created_at DESC LIMIT ?')
    .bind(limit)
    .all<Article>();

  return result.results || [];
}

export async function createArticle(
  db: D1Database,
  data: ExtractedContent & { url: string }
): Promise<number> {
  const result = await db
    .prepare(`
      INSERT INTO articles (
        url, title, content, excerpt, author, site_name,
        published_time, word_count, reading_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      data.url,
      data.title,
      data.content,
      data.excerpt,
      data.author,
      data.siteName,
      data.publishedTime,
      data.wordCount,
      data.readingTime
    )
    .run();

  return result.meta.last_row_id;
}

export async function markAsRead(db: D1Database, id: number): Promise<boolean> {
  const result = await db
    .prepare('UPDATE articles SET is_read = 1, read_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(id)
    .run();

  return result.success;
}

export async function markAsUnread(db: D1Database, id: number): Promise<boolean> {
  const result = await db
    .prepare('UPDATE articles SET is_read = 0, read_at = NULL WHERE id = ?')
    .bind(id)
    .run();

  return result.success;
}

export async function deleteArticle(db: D1Database, id: number): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM articles WHERE id = ?')
    .bind(id)
    .run();

  return result.success;
}

export async function getFavoriteArticles(db: D1Database, limit = 50): Promise<Article[]> {
  const result = await db
    .prepare('SELECT * FROM articles WHERE is_favorite = 1 ORDER BY created_at DESC LIMIT ?')
    .bind(limit)
    .all<Article>();

  return result.results || [];
}

export async function toggleFavorite(db: D1Database, id: number): Promise<boolean> {
  // Get current favorite status
  const article = await db
    .prepare('SELECT is_favorite FROM articles WHERE id = ?')
    .bind(id)
    .first<{ is_favorite: number }>();

  if (!article) {
    return false;
  }

  // Toggle the favorite status
  const newValue = article.is_favorite ? 0 : 1;
  const result = await db
    .prepare('UPDATE articles SET is_favorite = ? WHERE id = ?')
    .bind(newValue, id)
    .run();

  return result.success;
}

export async function getRandomFavorite(db: D1Database): Promise<Article | null> {
  const result = await db
    .prepare('SELECT * FROM articles WHERE is_favorite = 1 ORDER BY RANDOM() LIMIT 1')
    .first<Article>();

  return result || null;
}
