/**
 * GET /unread handler
 * Display list of unread articles
 */

import { getUnreadArticles } from '../services/articleService.js';
import { renderList } from '../templates/list.js';
import type { Env } from '../types.js';

/**
 * Handle GET /unread request
 */
export async function handleUnread(request: Request, env: Env): Promise<Response> {
  try {
    const articles = await getUnreadArticles(env.DB);

    const html = renderList(articles, 'unread');

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('GET /unread error:', error);
    return new Response(
      `Failed to load unread articles: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
