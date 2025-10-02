/**
 * Reader - GetPocket alternative
 * Cloudflare Workers entry point with routing
 */

import { handleHome } from './src/handlers/home.js';
import { handlePost } from './src/handlers/post.js';
import { handleReader } from './src/handlers/reader.js';
import { handleMarkRead } from './src/handlers/markRead.js';
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

      if (method === 'POST' && pathname === '/post') {
        return handlePost(request, env);
      }

      const readerMatch = pathname.match(/^\/r\/(\d+)$/);
      if (readerMatch) {
        const id = readerMatch[1];
        if (method === 'GET') {
          return handleReader(request, env, id);
        }
      }

      const markReadMatch = pathname.match(/^\/r\/(\d+)\/mark-read$/);
      if (markReadMatch) {
        const id = markReadMatch[1];
        if (method === 'POST') {
          return handleMarkRead(request, env, id);
        }
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