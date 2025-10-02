/**
 * GET /r/{id} handler
 * Display article in reader mode
 */

import { getArticle } from '../services/articleService.js';
import { renderReader } from '../templates/reader.js';
import type { Env } from '../types.js';

/**
 * Handle GET /r/{id} request
 */
export async function handleReader(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const articleId = parseInt(id, 10);

    if (isNaN(articleId)) {
      return new Response('Invalid article ID', { status: 400 });
    }

    const article = await getArticle(env.DB, articleId);

    if (!article) {
      return new Response('Article not found', { status: 404 });
    }

    const html = renderReader(article);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('GET /r/{id} error:', error);
    return new Response(
      `Failed to load article: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
