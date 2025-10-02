/**
 * POST /post handler
 * Save URL and extract content
 */

import { extractContent } from '../services/extractor.js';
import { createArticle, getArticleByUrl } from '../services/articleService.js';
import type { Env } from '../types.js';

/**
 * Handle POST /post request
 */
export async function handlePost(request: Request, env: Env): Promise<Response> {
  try {
    let url: string | null = null;

    // Method 1: Query string (?url=...)
    const reqUrl = new URL(request.url);
    url = reqUrl.searchParams.get('url');

    // Method 2: Form data
    if (!url) {
      const formData = await request.formData();
      const urlValue = formData.get('url');
      if (urlValue && typeof urlValue === 'string') {
        url = urlValue;
      }
    }

    // Method 3: Referer header
    if (!url) {
      url = request.headers.get('Referer');
    }

    if (!url) {
      return new Response('URL is required (use ?url=..., form data, or Referer header)', { status: 400 });
    }

    url = url.trim();

    // Validate URL format (must be absolute URL with protocol)
    try {
      const parsed = new URL(url);
      if (!parsed.protocol.startsWith('http')) {
        return new Response('URL must start with http:// or https://', { status: 400 });
      }
    } catch {
      return new Response('Invalid URL format', { status: 400 });
    }

    // Check if article already exists
    const existing = await getArticleByUrl(env.DB, url);
    if (existing) {
      const redirectUrl = new URL(`/r/${existing.id}`, request.url);
      return Response.redirect(redirectUrl.toString(), 302);
    }

    // Extract content from URL
    const content = await extractContent(url);

    // Save to database
    const articleId = await createArticle(env.DB, {
      url,
      ...content,
    });

    // Redirect to reader view (use absolute URL)
    const redirectUrl = new URL(`/r/${articleId}`, request.url);
    return Response.redirect(redirectUrl.toString(), 302);
  } catch (error) {
    console.error('POST /post error:', error);
    return new Response(
      `Failed to save article: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
