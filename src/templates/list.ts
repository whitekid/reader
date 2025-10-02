/**
 * List view template for displaying unread articles
 */

import { styles } from './styles.js';
import type { Article } from '../types.js';

/**
 * Render list of articles
 */
export function renderList(articles: Article[], isFavoritesMode = false): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reader - ${isFavoritesMode ? 'Favorites' : 'Unread Articles'}</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <style>${styles}</style>
</head>
<body>
  <div class="toolbar">
    <h1 style="margin: 0; font-size: 20px;">📚 Reader</h1>
    <div style="display: flex; gap: 10px;">
      <a href="/" style="${!isFavoritesMode ? 'font-weight: bold; text-decoration: underline;' : 'color: var(--text-secondary);'}">All</a>
      <a href="/favorites" style="${isFavoritesMode ? 'font-weight: bold; text-decoration: underline;' : 'color: var(--text-secondary);'}">★ Favorites</a>
      <a href="/random" style="margin-left: 10px; color: var(--text-secondary);">🎲 Random</a>
    </div>
  </div>

  <div class="container">
    <div class="add-url">
      <form method="POST" action="/post">
        <input
          type="url"
          name="url"
          placeholder="Paste URL to save article..."
          required
        />
        <button type="submit">+ Add</button>
      </form>
    </div>

    ${articles.length === 0 ? renderEmptyState(isFavoritesMode) : renderArticles(articles)}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Render articles list
 */
function renderArticles(articles: Article[]): string {
  return `
    <ul class="article-list">
      ${articles.map(article => `
        <li class="article-card">
          <h2><a href="/r/${article.id}">${escapeHtml(article.title)}</a></h2>
          <div class="meta">
            ${article.site_name ? escapeHtml(article.site_name) : 'Unknown'} •
            ${article.reading_time} min read
          </div>
          <div class="excerpt">${escapeHtml(article.excerpt)}</div>
        </li>
      `).join('')}
    </ul>
  `;
}

/**
 * Render empty state when no articles
 */
function renderEmptyState(isFavoritesMode: boolean): string {
  return `
    <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
      <p style="font-size: 18px; margin-bottom: 12px;">${isFavoritesMode ? 'No favorite articles' : 'No unread articles'}</p>
      <p>${isFavoritesMode ? 'Mark articles as favorite to see them here' : 'Add a URL above to get started'}</p>
    </div>
  `;
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
