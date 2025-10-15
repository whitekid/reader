(() => {
  const mode = document.body.dataset.mode;
  let nextCursor = document.body.dataset.nextCursor;
  let hasMore = document.body.dataset.hasMore === 'true';
  let isLoading = false;

  const container = document.getElementById('articles-container');
  const loadingIndicator = document.getElementById('loading-indicator');
  const sentinel = document.getElementById('scroll-sentinel');

  async function loadMoreArticles() {
    if (isLoading || !hasMore || !nextCursor) return;

    isLoading = true;
    loadingIndicator.style.display = 'block';

    try {
      const url = window.location.pathname + '?cursor=' + encodeURIComponent(nextCursor);
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to load');

      const data = await response.json();

      const articlesHtml = data.articles.map(article => renderArticle(article)).join('');
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = articlesHtml;

      const articleList = container.querySelector('.article-list');
      if (articleList) {
        Array.from(tempDiv.querySelectorAll('li')).forEach(li => {
          articleList.appendChild(li);
        });
      }

      nextCursor = data.nextCursor;
      hasMore = data.hasMore;

      if (!hasMore) {
        sentinel.remove();
      }
    } catch (error) {
      console.error('Error loading more articles:', error);
    } finally {
      isLoading = false;
      loadingIndicator.style.display = 'none';
    }
  }

  function renderArticle(article) {
    return `
      <li class="article-card" data-id="${article.id}" data-read="${article.is_read}" data-favorite="${article.is_favorite}">
        <div class="article-card-content">
          <h2><a href="/r/${article.id}">${escapeHtml(article.title)}</a></h2>
          <div class="meta">
            ${article.site_name ? escapeHtml(article.site_name) : 'Unknown'} •
            ${article.reading_time} min read
          </div>
          <div class="excerpt">${escapeHtml(article.excerpt)}</div>

          <div class="article-actions" style="display: flex; gap: 2px;">
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
              <button type="submit" style="color: #dc2626;" title="Delete">
                🗑️
              </button>
            </form>
          </div>
        </div>

        <div class="swipe-actions">
          <button class="swipe-read"
                  title="${article.is_read ? 'Mark as Unread' : 'Mark as Read'}"
                  aria-label="${article.is_read ? 'Mark as Unread' : 'Mark as Read'}">
            ${article.is_read ? '○' : '✓'}
          </button>
          <button class="swipe-favorite"
                  title="${article.is_favorite ? 'Unfavorite' : 'Favorite'}"
                  aria-label="${article.is_favorite ? 'Unfavorite' : 'Favorite'}">
            ${article.is_favorite ? '★' : '☆'}
          </button>
          <button class="swipe-delete delete"
                  title="Delete"
                  aria-label="Delete article">
            🗑️
          </button>
        </div>
      </li>
    `;
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  // Swipe gesture handler for mobile
  let swipeState = {
    startX: 0,
    currentX: 0,
    isDragging: false,
    activeCard: null,
    activeContent: null
  };

  document.addEventListener('touchstart', (e) => {
    const card = e.target.closest('.article-card');
    if (!card) return;

    if (e.target.tagName === 'A' || e.target.closest('a') || e.target.tagName === 'BUTTON') {
      return;
    }

    const content = card.querySelector('.article-card-content');
    if (!content) return;

    swipeState.startX = e.touches[0].clientX;
    swipeState.isDragging = true;
    swipeState.activeCard = card;
    swipeState.activeContent = content;
    content.style.transition = 'none';
  });

  document.addEventListener('touchmove', (e) => {
    if (!swipeState.isDragging || !swipeState.activeContent) return;

    swipeState.currentX = e.touches[0].clientX;
    const diff = swipeState.currentX - swipeState.startX;

    if (diff < 0) {
      const distance = Math.min(Math.abs(diff), 120);
      swipeState.activeContent.style.transform = 'translateX(-' + distance + 'px)';
    }
  });

  document.addEventListener('touchend', (e) => {
    if (!swipeState.isDragging || !swipeState.activeCard || !swipeState.activeContent) return;

    const diff = swipeState.currentX - swipeState.startX;
    swipeState.activeContent.style.transition = 'transform 0.3s ease-out';

    if (diff < -60) {
      swipeState.activeCard.classList.add('swiped');
      swipeState.activeContent.style.transform = 'translateX(-120px)';
    } else {
      swipeState.activeCard.classList.remove('swiped');
      swipeState.activeContent.style.transform = 'translateX(0)';
    }

    swipeState.isDragging = false;
    swipeState.activeCard = null;
    swipeState.activeContent = null;
  });

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.matches('.swipe-read, .swipe-favorite, .swipe-delete')) return;

    const card = target.closest('.article-card');
    if (!card) return;

    const id = card.dataset.id;

    if (target.classList.contains('swipe-read')) {
      submitForm('/r/' + id + '/mark-read', 'POST');
    } else if (target.classList.contains('swipe-favorite')) {
      submitForm('/favorite/' + id, 'POST');
    } else if (target.classList.contains('swipe-delete')) {
      if (confirm('Delete this article?')) {
        submitForm('/r/' + id, 'POST', { _method: 'DELETE' });
      }
    }
  });

  function submitForm(action, method, extraFields) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = action;

    if (extraFields) {
      Object.entries(extraFields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });
    }

    document.body.appendChild(form);
    form.submit();
  }

  document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.article-card')) {
      document.querySelectorAll('.article-card.swiped').forEach(card => {
        card.classList.remove('swiped');
        const content = card.querySelector('.article-card-content');
        if (content) {
          content.style.transform = 'translateX(0)';
        }
      });
    }
  });
})();
