/**
 * Type definitions for Reader application
 */

export interface Article {
  id: number;
  url: string;
  title: string;
  content: string;
  excerpt: string;
  author: string | null;
  site_name: string | null;
  published_time: string | null;
  word_count: number;
  reading_time: number;
  is_read: number; // 0: unread, 1: read
  is_favorite: number; // 0: not favorite, 1: favorite
  created_at: string;
  read_at: string | null;
}

export interface ExtractedContent {
  title: string;
  content: string;
  excerpt: string;
  author: string | null;
  siteName: string | null;
  publishedTime: string | null;
  wordCount: number;
  readingTime: number;
}

export interface Env {
  DB: D1Database;
}
