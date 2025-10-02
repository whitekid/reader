/**
 * GET /random handler
 * Redirect to a random favorite article
 */

import { getRandomFavorite } from '../services/articleService.js';
import type { Env } from '../types.js';

/**
 * Handle GET /random request
 */
export async function handleRandom(request: Request, env: Env): Promise<Response> {
  try {
    const article = await getRandomFavorite(env.DB);

    if (!article) {
      // No favorites found, redirect to home
      const homeUrl = new URL('/', request.url);
      return Response.redirect(homeUrl.toString(), 302);
    }

    // Redirect to the random favorite article
    const articleUrl = new URL(`/r/${article.id}`, request.url);
    return Response.redirect(articleUrl.toString(), 302);
  } catch (error) {
    console.error('GET /random error:', error);
    return new Response(
      `Failed to get random favorite: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
