/**
 * List view template for displaying unread articles
 */

import { styles } from './styles.js';
import type { Article } from '../types.js';

type ViewMode = 'all' | 'unread' | 'favorites';

/**
 * Render list of articles
 */
export function renderList(
  articles: Article[],
  mode: ViewMode = 'all',
  nextCursor: string | null = null,
  hasMore: boolean = false
): string {
  const titleText = mode === 'favorites' ? 'Favorites' : mode === 'unread' ? 'Unread' : 'All Articles';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reader - ${titleText}</title>
  <meta name="description" content="A simple and clean reader for your saved articles.">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">

  <!-- Apply theme before CSS loads to prevent FOUC -->
  <script>
    (function() {
      try {
        var theme = localStorage.getItem('theme');
        var validThemes = ['light', 'dark', 'auto'];
        if (theme && validThemes.indexOf(theme) !== -1 && theme !== 'auto') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      } catch (e) {
        // localStorage unavailable (private browsing, etc.) - gracefully continue
      }
    })();
  </script>

  <style>
    ${styles}

    /* Article card positioning for overlay */
    .article-card {
      position: relative;
    }

    /* Desktop hover actions - only show on hover-capable devices */
    @media (hover: hover) {
      .article-actions {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 0;
        transition: opacity 0.2s;
        background: rgba(30, 30, 30, 0.95);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 2px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        backdrop-filter: blur(4px);
      }

      @media (prefers-color-scheme: light) {
        .article-actions {
          background: rgba(255, 255, 255, 0.95);
        }
      }

      .article-actions button {
        background: none;
        border: none;
        padding: 6px 8px;
        font-size: 16px;
        cursor: pointer;
        color: var(--text-primary);
        border-radius: 4px;
        transition: background 0.15s;
      }

      .article-actions button:hover {
        background: var(--bg-primary);
      }

      .article-card:hover .article-actions {
        opacity: 1;
      }

      /* Hide swipe actions on desktop */
      .swipe-actions {
        display: none;
      }
    }

    /* Hide hover actions on touch devices */
    @media (hover: none) {
      .article-actions {
        display: none;
      }
    }

    /* Mobile navigation - show icons only */
    @media (max-width: 640px) {
      .nav-menu {
        gap: 4px !important;
      }

      .nav-text {
        display: none;
      }

      .nav-icon {
        display: inline;
        font-size: 18px;
      }
    }

    /* Desktop navigation - show text only */
    @media (min-width: 641px) {
      .nav-text {
        display: inline;
      }

      .nav-icon {
        display: none;
      }
    }

    /* Swipe actions for mobile */
    @media (hover: none) {
      .article-card {
        overflow: hidden;
        position: relative;
      }

      .article-card-content {
        position: relative;
        transition: transform 0.3s ease-out;
        background: var(--bg-primary);
        z-index: 2;
      }

      .article-card.swiped .article-card-content {
        transform: translateX(-120px);
      }

      .swipe-actions {
        position: absolute;
        top: 0;
        right: -120px;
        width: 120px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-around;
        background: var(--bg-secondary);
        z-index: 1;
      }

      .article-card.swiped .swipe-actions {
        right: 0;
      }

      .swipe-actions button {
        background: none;
        border: none;
        font-size: 22px;
        padding: 12px;
        cursor: pointer;
        color: var(--text-primary);
        transition: opacity 0.2s;
      }

      .swipe-actions button:active {
        opacity: 0.6;
      }

      .swipe-actions button.delete {
        color: #ef4444;
      }
    }
  </style>
</head>
<body data-mode="${mode}" data-next-cursor="${nextCursor || ''}" data-has-more="${hasMore}">
  <div class="toolbar">
    <h1 style="margin: 0; font-size: 20px;">📚 Reader</h1>
    <div class="nav-menu" style="display: flex; gap: 10px;">
      <a href="/all" class="${mode === 'all' ? 'active' : ''}">
        <span class="nav-text">All</span><span class="nav-icon">📄</span>
      </a>
      <a href="/unread" class="${mode === 'unread' ? 'active' : ''}">
        <span class="nav-text">Unread</span><span class="nav-icon">○</span>
      </a>
      <a href="/favorites" class="${mode === 'favorites' ? 'active' : ''}">
        <span class="nav-text">Favorites</span><span class="nav-icon">★</span>
      </a>
      <a href="/random">
        <span class="nav-text">Random</span><span class="nav-icon">🎲</span>
      </a>
      <button id="theme-toggle" title="Theme: auto" aria-label="Toggle theme (current: auto)" type="button">💻</button>
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

    <div id="articles-container">
      ${articles.length === 0 ? renderEmptyState(mode) : renderArticles(articles)}
    </div>

    ${hasMore ? `
      <div id="loading-indicator" style="text-align: center; padding: 20px; color: var(--text-secondary); display: none;">
        Loading more articles...
      </div>
      <div id="scroll-sentinel" style="height: 1px;"></div>
    ` : ''}
  </div>

  <script src="/public/list.js" defer></script>
  <script src="/public/theme.js" defer></script>
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
      ${articles.map(article => renderArticle(article)).join('')}
    </ul>
  `;
}

function renderArticle(article: Article): string {
  return `
    <li class="article-card" data-id="${article.id}" data-read="${article.is_read}" data-favorite="${article.is_favorite}">
      <div class="article-card-content">
        <h2><a href="/r/${article.id}">${escapeHtml(article.title)}</a></h2>
        <div class="meta">
          <span>${article.site_name ? escapeHtml(article.site_name) : 'Unknown'}</span>
          <span>•</span>
          <span>${article.reading_time} min read</span>
        </div>
        <div class="excerpt">${escapeHtml(article.excerpt)}</div>
      </div>
      <div class="article-actions">
        <form method="POST" action="/r/${article.id}/mark-read" style="margin: 0;">
          <button type="submit" title="${article.is_read ? 'Mark as Unread' : 'Mark as Read'}">
            ${article.is_read ? '○' : '✓'}
          </button>
        </form>
        <form method="POST" action="/favorite/${article.id}" style="margin: 0;">
          <button type="submit" title="${article.is_favorite ? 'Unfavorite' : 'Favorite'}">
            ${article.is_favorite ? '★' : '☆'}
          </button>
        </form>
        <form method="POST" action="/r/${article.id}" style="margin: 0;" onsubmit="return confirm('Delete this article?');">
          <input type="hidden" name="_method" value="DELETE">
          <button type="submit" class="delete" title="Delete">
            🗑️
          </button>
        </form>
      </div>
    </li>
  `;
}

/**
 * Render empty state when no articles
 */
function renderEmptyState(mode: ViewMode): string {
  const messages = {
    all: ['No articles yet', 'Add a URL above to get started'],
    unread: ['No unread articles', 'All caught up!'],
    favorites: ['No favorite articles', 'Mark articles as favorite to see them here']
  };
  const [title, subtitle] = messages[mode];

  return `
    <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
      <p style="font-size: 18px; margin-bottom: 12px;">${title}</p>
      <p>${subtitle}</p>
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