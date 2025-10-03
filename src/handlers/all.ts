/**
 * GET /all handler
 * Display list of all articles
 */

import { getAllArticles } from '../services/articleService.js';
import { renderList } from '../templates/list.js';
import type { Env } from '../types.js';

/**
 * Handle GET /all request
 */
export async function handleAll(request: Request, env: Env): Promise<Response> {
  try {
    const articles = await getAllArticles(env.DB);

    const html = renderList(articles, 'all');

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('GET /all error:', error);
    return new Response(
      `Failed to load articles: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
