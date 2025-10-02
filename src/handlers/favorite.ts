/**
 * POST /favorite/:id handler
 * Toggle favorite status for an article
 */

import { toggleFavorite } from '../services/articleService.js';
import type { Env } from '../types.js';

/**
 * Handle POST /favorite/:id request
 */
export async function handleFavorite(
  request: Request,
  env: Env,
  id: number
): Promise<Response> {
  try {
    const success = await toggleFavorite(env.DB, id);

    if (!success) {
      return new Response('Article not found', { status: 404 });
    }

    // Redirect back to the article or referer
    const referer = request.headers.get('Referer');
    const redirectUrl = referer
      ? new URL(referer)
      : new URL(`/r/${id}`, request.url);

    return Response.redirect(redirectUrl.toString(), 302);
  } catch (error) {
    console.error('POST /favorite/:id error:', error);
    return new Response(
      `Failed to toggle favorite: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
