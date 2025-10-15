/**
 * GET /sitemap.xml handler
 * Generates a sitemap of all articles
 */

import { getAllArticles } from '../services/articleService.js';
import type { Env } from '../types.js';

export async function handleSitemap(request: Request, env: Env): Promise<Response> {
  try {
    const articles = await getAllArticles(env.DB, 1000); // Limit to 1000 articles for now

    const urls = articles.map(article => {
      return `
        <url>
          <loc>${new URL(`/r/${article.id}`, request.url).toString()}</loc>
          <lastmod>${new Date(article.created_at).toISOString()}</lastmod>
        </url>
      `;
    }).join('');

    const sitemap = `
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${new URL('/', request.url).toString()}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
        </url>
        ${urls}
      </urlset>
    `.trim();

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('GET /sitemap.xml error:', error);
    return new Response('Failed to generate sitemap', { status: 500 });
  }
}
