/**
 * POST /r/{id}/mark-read handler
 * Toggle article read status
 */

import { markAsRead, markAsUnread, getArticle } from '../services/articleService.js';
import type { Env } from '../types.js';

/**
 * Handle POST /r/{id}/mark-read request
 * Toggles between read and unread
 */
export async function handleMarkRead(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const articleId = parseInt(id, 10);

    if (isNaN(articleId)) {
      return new Response('Invalid article ID', { status: 400 });
    }

    // Get current read status
    const article = await getArticle(env.DB, articleId);
    if (!article) {
      return new Response('Article not found', { status: 404 });
    }

    // Toggle read status
    const success = article.is_read
      ? await markAsUnread(env.DB, articleId)
      : await markAsRead(env.DB, articleId);

    if (!success) {
      return new Response('Failed to update article status', { status: 500 });
    }

    // Redirect back to article (use Referer or article URL)
    const referer = request.headers.get('Referer');
    const redirectUrl = referer
      ? new URL(referer)
      : new URL(`/r/${articleId}`, request.url);
    return Response.redirect(redirectUrl.toString(), 302);
  } catch (error) {
    console.error('POST /r/{id}/mark-read error:', error);
    return new Response(
      `Failed to update article status: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
