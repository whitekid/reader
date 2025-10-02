/**
 * GET /favorites handler
 * Display list of favorite articles
 */

import { getFavoriteArticles } from '../services/articleService.js';
import { renderList } from '../templates/list.js';
import type { Env } from '../types.js';

/**
 * Handle GET /favorites request
 */
export async function handleFavorites(request: Request, env: Env): Promise<Response> {
  try {
    const articles = await getFavoriteArticles(env.DB);

    const html = renderList(articles, true); // true = favorites mode

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('GET /favorites error:', error);
    return new Response(
      `Failed to load favorite articles: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
