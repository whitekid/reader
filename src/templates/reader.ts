/**
 * Reader view template for displaying articles
 */

import { styles } from './styles.js';
import type { Article } from '../types.js';

/**
 * Render article in reader mode
 */
export function renderReader(article: Article): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(article.title)} - Reader</title>
  <style>${styles}</style>
</head>
<body>
  <div class="toolbar">
    <a href="/">← Back</a>
    <form method="POST" action="/r/${article.id}/mark-read" style="margin: 0;">
      <button type="submit">✓ Mark as Read</button>
    </form>
  </div>

  <div class="container">
    <h1>${escapeHtml(article.title)}</h1>

    <div class="meta">
      ${article.author ? `by ${escapeHtml(article.author)} • ` : ''}
      ${article.site_name ? escapeHtml(article.site_name) : ''} •
      ${article.reading_time} min read
    </div>

    <div class="article-content">
      ${article.content}
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
