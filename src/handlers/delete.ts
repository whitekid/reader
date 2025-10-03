/**
 * DELETE /r/{id} handler
 * Delete article (RESTful)
 */

import { deleteArticle } from '../services/articleService.js';
import type { Env } from '../types.js';

/**
 * Handle DELETE /r/{id} request
 * Also handles POST with _method=DELETE for HTML forms
 */
export async function handleDelete(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const articleId = parseInt(id, 10);

    if (isNaN(articleId)) {
      return new Response('Invalid article ID', { status: 400 });
    }

    // Check if this is a POST with _method=DELETE (form submission)
    if (request.method === 'POST') {
      const formData = await request.formData();
      const method = formData.get('_method');
      if (method !== 'DELETE') {
        return new Response('Method not allowed', { status: 405 });
      }
    }

    const success = await deleteArticle(env.DB, articleId);

    if (!success) {
      return new Response('Failed to delete article', { status: 500 });
    }

    // Redirect to home
    const url = new URL('/', request.url);
    return Response.redirect(url.toString(), 302);
  } catch (error) {
    console.error('DELETE /r/{id} error:', error);
    return new Response(
      `Failed to delete article: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
