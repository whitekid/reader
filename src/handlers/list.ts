/**
 * GET /all, /unread, /favorites handler
 * Unified list handler with infinite scroll support
 */

import { getAllArticlesPaginated, getUnreadArticlesPaginated, getFavoriteArticlesPaginated } from '../services/articleService.js';
import { renderList } from '../templates/list.js';
import { validateCursor } from '../utils/validation.js';
import { createHtmlResponse, createJsonResponse, ErrorResponses } from '../utils/response.js';
import type { Env } from '../types.js';

/**
 * View mode for list display
 */
export type ViewMode = 'all' | 'unread' | 'favorites';

/**
 * Service function map for different view modes
 */
const serviceMap = {
  all: getAllArticlesPaginated,
  unread: getUnreadArticlesPaginated,
  favorites: getFavoriteArticlesPaginated,
};

/**
 * Handle GET /all, /unread, or /favorites request
 */
export async function handleList(request: Request, env: Env, mode: ViewMode): Promise<Response> {
  try {
    const url = new URL(request.url);
    const cursor = validateCursor(url.searchParams.get('cursor'));
    const accept = request.headers.get('accept') || '';

    // Get the appropriate service function for the mode
    const getArticles = serviceMap[mode];
    const { articles, nextCursor, hasMore } = await getArticles(
      env.DB,
      cursor,
      20
    );

    // JSON API for AJAX requests
    if (accept.includes('application/json')) {
      return createJsonResponse({ articles, nextCursor, hasMore });
    }

    // HTML response for initial page load
    const html = renderList(articles, mode, nextCursor, hasMore);
    return createHtmlResponse(html);
  } catch (error) {
    console.error(`GET /${mode} error:`, error);

    if ((error as Error).message.includes('Invalid cursor')) {
      return ErrorResponses.badRequest('Invalid cursor format');
    }

    return ErrorResponses.internalError(`Failed to load ${mode} articles`, (error as Error).message);
  }
}
