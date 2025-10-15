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
  <meta name="description" content="${escapeHtml(article.excerpt)}">
  <meta name="keywords" content="reader, article, pocket, readability">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(article.url)}">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(article.excerpt)}">
  <meta property="og:site_name" content="Reader">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary">
  <meta property="twitter:url" content="${escapeHtml(article.url)}">
  <meta property="twitter:title" content="${escapeHtml(article.title)}">
  <meta property="twitter:description" content="${escapeHtml(article.excerpt)}">

  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${escapeHtml(article.title)}",
      "author": {
        "@type": "Person",
        "name": "${escapeHtml(article.author || article.site_name || 'Unknown')}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Reader",
        "logo": {
          "@type": "ImageObject",
          "url": "/favicon.svg"
        }
      },
      "description": "${escapeHtml(article.excerpt)}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${escapeHtml(article.url)}"
      }
    }
  </script>

  <style>
    ${styles}
  </style>
</head>
<body>
  <div class="toolbar">
    <a href="/"><span class="toolbar-icon">←</span><span class="toolbar-text"> Back</span></a>
    <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer"><span class="toolbar-icon">🔗</span><span class="toolbar-text"> Original</span></a>
    <form method="POST" action="/r/${article.id}/mark-read" style="margin: 0;">
      <button type="submit"><span class="toolbar-icon">${article.is_read ? '○' : '✓'}</span><span class="toolbar-text"> ${article.is_read ? 'Unread' : 'Read'}</span></button>
    </form>
    <form method="POST" action="/favorite/${article.id}" style="margin: 0;">
      <button type="submit"><span class="toolbar-icon">${article.is_favorite ? '★' : '☆'}</span><span class="toolbar-text"> Favorite</span></button>
    </form>
    <form method="POST" action="/r/${article.id}" style="margin: 0;" onsubmit="return confirm('Delete this article?');">
      <input type="hidden" name="_method" value="DELETE">
      <button type="submit" class="delete"><span class="toolbar-icon">🗑️</span><span class="toolbar-text"> Delete</span></button>
    </form>
  </div>

  <div class="container">
    <h1>${escapeHtml(article.title)}</h1>

    <div class="meta">
      ${article.author ? `<span>by ${escapeHtml(article.author)}</span><span>•</span>` : ''}
      ${article.site_name ? `<a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">${escapeHtml(article.site_name)}</a><span>•</span>` : ''}
      <span>${article.reading_time} min read</span>
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
