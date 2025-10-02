/**
 * POST /r/{id}/mark-read handler
 * Mark article as read
 */

import { markAsRead } from '../services/articleService.js';
import type { Env } from '../types.js';

/**
 * Handle POST /r/{id}/mark-read request
 */
export async function handleMarkRead(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const articleId = parseInt(id, 10);

    if (isNaN(articleId)) {
      return new Response('Invalid article ID', { status: 400 });
    }

    const success = await markAsRead(env.DB, articleId);

    if (!success) {
      return new Response('Failed to mark article as read', { status: 500 });
    }

    // Redirect to home (use absolute URL)
    const url = new URL('/', request.url);
    return Response.redirect(url.toString(), 302);
  } catch (error) {
    console.error('POST /r/{id}/mark-read error:', error);
    return new Response(
      `Failed to mark article as read: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
