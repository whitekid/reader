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

export async function getAllArticles(db: D1Database, limit = 50): Promise<Article[]> {
  const result = await db
    .prepare('SELECT * FROM articles ORDER BY created_at DESC LIMIT ?')
    .bind(limit)
    .all<Article>();

  return result.results || [];
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

export async function updateArticleContent(
  db: D1Database,
  id: number,
  data: ExtractedContent
): Promise<boolean> {
  const result = await db
    .prepare(`
      UPDATE articles
      SET title = ?, content = ?, excerpt = ?, author = ?, site_name = ?,
          published_time = ?, word_count = ?, reading_time = ?,
          is_read = 0, created_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(
      data.title,
      data.content,
      data.excerpt,
      data.author,
      data.siteName,
      data.publishedTime,
      data.wordCount,
      data.readingTime,
      id
    )
    .run();

  return result.success;
}



export async function toggleReadStatus(db: D1Database, id: number): Promise<boolean> {
  const result = await db
    .prepare('UPDATE articles SET is_read = CASE WHEN is_read = 1 THEN 0 ELSE 1 END, read_at = CASE WHEN is_read = 1 THEN NULL ELSE CURRENT_TIMESTAMP END WHERE id = ?')
    .bind(id)
    .run();

  return result.success;
}

/**
 * Pagination result with cursor support
 */

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
  const result = await db
    .prepare('UPDATE articles SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?')
    .bind(id)
    .run();

  return result.success;
}

export async function getRandomFavorite(db: D1Database): Promise<Article | null> {
  const result = await db
    .prepare('SELECT * FROM articles WHERE is_favorite = 1 ORDER BY RANDOM() LIMIT 1')
    .first<Article>();

  return result || null;
}

/**
 * Pagination result with cursor support
 */
export interface PaginatedArticles {
  articles: Article[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Parse cursor string to timestamp and id
 */
function parseCursor(cursor: string): { timestamp: string; id: number } | null {
  try {
    const [timestamp, idStr] = cursor.split(':');
    const id = parseInt(idStr, 10);
    if (!timestamp || isNaN(id)) return null;
    return { timestamp, id };
  } catch {
    return null;
  }
}

/**
 * Create cursor string from article
 */
function createCursor(article: Article): string {
  return `${article.created_at}:${article.id}`;
}

async function getArticlesPaginated(
  db: D1Database,
  whereClause: string,
  cursor: string | null = null,
  limit = 20
): Promise<PaginatedArticles> {
  let query: string;
  let bindings: (string | number)[];

  const baseQuery = `SELECT * FROM articles ${whereClause}`;
  const orderBy = 'ORDER BY created_at DESC, id DESC';

  if (cursor) {
    const parsed = parseCursor(cursor);
    if (!parsed) {
      throw new Error('Invalid cursor format');
    }
    const cursorClause = `(created_at < ? OR (created_at = ? AND id < ?))`;
    const where = whereClause ? `${whereClause} AND ${cursorClause}` : `WHERE ${cursorClause}`;
    query = `SELECT * FROM articles ${where} ${orderBy} LIMIT ?`;
    bindings = [parsed.timestamp, parsed.timestamp, parsed.id, limit + 1];
  } else {
    query = `${baseQuery} ${orderBy} LIMIT ?`;
    bindings = [limit + 1];
  }

  const result = await db.prepare(query).bind(...bindings).all<Article>();
  const articles = result.results || [];

  const hasMore = articles.length > limit;
  if (hasMore) {
    articles.pop(); // Remove extra item
  }

  const nextCursor = hasMore && articles.length > 0
    ? createCursor(articles[articles.length - 1])
    : null;

  return { articles, nextCursor, hasMore };
}

/**
 * Get all articles with cursor-based pagination
 */
export async function getAllArticlesPaginated(
  db: D1Database,
  cursor: string | null = null,
  limit = 20
): Promise<PaginatedArticles> {
  return getArticlesPaginated(db, '', cursor, limit);
}

/**
 * Get unread articles with cursor-based pagination
 */
export async function getUnreadArticlesPaginated(
  db: D1Database,
  cursor: string | null = null,
  limit = 20
): Promise<PaginatedArticles> {
  return getArticlesPaginated(db, 'WHERE is_read = 0', cursor, limit);
}

/**
 * Get favorite articles with cursor-based pagination
 */
export async function getFavoriteArticlesPaginated(
  db: D1dDatabase,
  cursor: string | null = null,
  limit = 20
): Promise<PaginatedArticles> {
  return getArticlesPaginated(db, 'WHERE is_favorite = 1', cursor, limit);
}
