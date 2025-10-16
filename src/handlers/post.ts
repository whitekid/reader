/**
 * POST /post handler
 * Save URL and extract content
 */

import { extractContent } from '../services/extractor.js';
import { createArticle, getArticleByUrl, updateArticleContent } from '../services/articleService.js';
import type { Env } from '../types.js';

/**
 * Normalize URL by removing tracking parameters
 */
function normalizeUrl(urlString: string): string {
  const url = new URL(urlString);

  // Common tracking parameters to remove
  const trackingParams = [
    // Common tracking parameters
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'fbclid', 'gclid', 'msclkid', 'dclid',

    // Other common parameters
    'ref', 'source', 'ref_src', 'ref_url', 'embed', 'share',

    // Social media specific
    'si', // Spotify
    'igshid', // Instagram
    's_src', 's_cid', // Adobe Analytics

    // Mailchimp
    'mc_cid', 'mc_eid',

    // HubSpot
    '_hsenc', '_hsmi',

    // YouTube
    'feature', 'list', 'index', 't',
  ];

  trackingParams.forEach(param => {
    url.searchParams.delete(param);
  });

  return url.toString();
}

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

    // Normalize URL by removing tracking parameters
    url = normalizeUrl(url);

    // Extract content from URL (always extract to get latest version)
    const content = await extractContent(url);

    // Check if article exists
    const existing = await getArticleByUrl(env.DB, url);
    let articleId: number;

    if (existing) {
      // Update existing article
      await updateArticleContent(env.DB, existing.id, content);
      articleId = existing.id;
    } else {
      // Create new article
      articleId = await createArticle(env.DB, { ...content, url });
    }

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
