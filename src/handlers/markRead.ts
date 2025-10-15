/**
 * POST /r/{id}/mark-read handler
 * Toggle article read status
 */

import { toggleReadStatus } from '../services/articleService.js';
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

    // Redirect back to the previous page
    const referer = request.headers.get('Referer');
    return Response.redirect(referer || '/', 302);
  } catch (error) {
    console.error('POST /r/{id}/mark-read error:', error);
    return new Response(
      `Failed to update article status: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
