/**
 * Response utilities for Cloudflare Workers
 */

/**
 * Create HTML response with proper headers
 */
export function createHtmlResponse(html: string): Response {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

/**
 * Create JSON response with proper headers
 */
export function createJsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

/**
 * Standard error responses
 */
export const ErrorResponses = {
  /**
   * 400 Bad Request
   */
  badRequest(message: string): Response {
    return new Response(
      JSON.stringify({
        error: 'Bad Request',
        message,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  },

  /**
   * 500 Internal Server Error
   */
  internalError(message: string, details?: string): Response {
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message,
        ...(details && { details }),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  },
};
