import { getNextUnreadArticle, toggleReadStatus } from '../services/articleService.js';
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

    const success = await toggleReadStatus(env.DB, articleId);

    if (!success) {
      return new Response('Failed to update article status', { status: 500 });
    }

    // Find next unread article to redirect to
    const nextArticle = await getNextUnreadArticle(env.DB);

    if (nextArticle) {
      const redirectUrl = new URL(`/r/${nextArticle.id}`, request.url);
      return Response.redirect(redirectUrl.toString(), 302);
    }

    // If no more unread articles, redirect to the unread list
    const unreadUrl = new URL('/unread', request.url);
    return Response.redirect(unreadUrl.toString(), 302);
  } catch (error) {
    console.error('POST /r/{id}/mark-read error:', error);
    return new Response(
      `Failed to update article status: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
