/**
 * Reader - GetPocket alternative
 * Cloudflare Workers entry point with routing
 */

import { handleHome } from './src/handlers/home.js';
import { handlePost } from './src/handlers/post.js';
import { handleReader } from './src/handlers/reader.js';
import { handleMarkRead } from './src/handlers/markRead.js';
import { handleFavorite } from './src/handlers/favorite.js';
import { handleFavorites } from './src/handlers/favorites.js';
import { handleUnread } from './src/handlers/unread.js';
import { handleRandom } from './src/handlers/random.js';
import { handleDelete } from './src/handlers/delete.js';
import type { Env } from './src/types.js';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    try {
      // Router
      if (method === 'GET' && pathname === '/') {
        return handleHome(request, env);
      }

      if ((method === 'GET' || method === 'POST') && pathname === '/post') {
        return handlePost(request, env);
      }

      const readerMatch = pathname.match(/^\/r\/(\d+)$/);
      if (readerMatch) {
        const id = readerMatch[1];
        if (method === 'GET') {
          return handleReader(request, env, id);
        }
        // DELETE /r/:id (RESTful) or POST with _method=DELETE
        if (method === 'DELETE' || method === 'POST') {
          return handleDelete(request, env, id);
        }
      }

      const markReadMatch = pathname.match(/^\/r\/(\d+)\/mark-read$/);
      if (markReadMatch) {
        const id = markReadMatch[1];
        if (method === 'POST') {
          return handleMarkRead(request, env, id);
        }
      }

      const favoriteMatch = pathname.match(/^\/favorite\/(\d+)$/);
      if (favoriteMatch) {
        const id = parseInt(favoriteMatch[1], 10);
        if (method === 'POST') {
          return handleFavorite(request, env, id);
        }
      }

      if (method === 'GET' && pathname === '/unread') {
        return handleUnread(request, env);
      }

      if (method === 'GET' && pathname === '/favorites') {
        return handleFavorites(request, env);
      }

      if (method === 'GET' && pathname === '/random') {
        return handleRandom(request, env);
      }

      // Static file: favicon.svg
      if (method === 'GET' && pathname === '/favicon.svg') {
        const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
  <g transform="translate(50, 50)">
    <path d="M -25 -15 Q -25 -20, -20 -20 L -5 -20 Q 0 -20, 0 -15 L 0 20 Q 0 25, -5 25 L -20 25 Q -25 25, -25 20 Z"
          fill="#ffffff" opacity="0.95"/>
    <path d="M 25 -15 Q 25 -20, 20 -20 L 5 -20 Q 0 -20, 0 -15 L 0 20 Q 0 25, 5 25 L 20 25 Q 25 25, 25 20 Z"
          fill="#ffffff" opacity="0.95"/>
    <rect x="-1" y="-20" width="2" height="45" fill="#1e40af"/>
    <line x1="-20" y1="-10" x2="-5" y2="-10" stroke="#2563eb" stroke-width="1.5" opacity="0.5"/>
    <line x1="-20" y1="-5" x2="-5" y2="-5" stroke="#2563eb" stroke-width="1.5" opacity="0.5"/>
    <line x1="-20" y1="0" x2="-5" y2="0" stroke="#2563eb" stroke-width="1.5" opacity="0.5"/>
    <line x1="-20" y1="5" x2="-8" y2="5" stroke="#2563eb" stroke-width="1.5" opacity="0.5"/>
    <line x1="5" y1="-10" x2="20" y2="-10" stroke="#2563eb" stroke-width="1.5" opacity="0.5"/>
    <line x1="5" y1="-5" x2="20" y2="-5" stroke="#2563eb" stroke-width="1.5" opacity="0.5"/>
    <line x1="5" y1="0" x2="20" y2="0" stroke="#2563eb" stroke-width="1.5" opacity="0.5"/>
    <line x1="8" y1="5" x2="20" y2="5" stroke="#2563eb" stroke-width="1.5" opacity="0.5"/>
    <path d="M 15 -20 L 15 10 L 18 7 L 21 10 L 21 -20 Z" fill="#dc2626" opacity="0.9"/>
  </g>
</svg>`;
        return new Response(faviconSvg, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }

      // 404 Not Found
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Unexpected error:', error);
      return new Response(
        `Internal Server Error: ${(error as Error).message}`,
        { status: 500 }
      );
    }
  },
};