/**
 * GET /all handler
 * Display list of all articles with infinite scroll support
 */

import { getAllArticlesPaginated } from '../services/articleService.js';
import { renderList } from '../templates/list.js';
import type { Env } from '../types.js';

/**
 * Handle GET /all request
 */
export async function handleAll(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const accept = request.headers.get('accept') || '';

    const { articles, nextCursor, hasMore } = await getAllArticlesPaginated(
      env.DB,
      cursor,
      20
    );

    // JSON API for AJAX requests
    if (accept.includes('application/json')) {
      return new Response(JSON.stringify({ articles, nextCursor, hasMore }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // HTML response for initial page load
    const html = renderList(articles, 'all', nextCursor, hasMore);

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
