/**
 * Shared CSS styles for Reader application
 * Safari Reader-inspired design with dark mode support
 */

export const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --bg: #fafafa;
    --text: #1a1a1a;
    --text-secondary: #666;
    --toolbar-bg: #ffffff;
    --toolbar-border: #e0e0e0;
    --card-bg: #ffffff;
    --card-border: #e8e8e8;
    --link: #0066cc;
    --link-hover: #0052a3;
    --button-bg: #f0f0f0;
    --button-hover: #e0e0e0;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #1a1a1a;
      --text: #e8e8e8;
      --text-secondary: #999;
      --toolbar-bg: #2a2a2a;
      --toolbar-border: #3a3a3a;
      --card-bg: #2a2a2a;
      --card-border: #3a3a3a;
      --link: #4d9fff;
      --link-hover: #6db0ff;
      --button-bg: #3a3a3a;
      --button-hover: #4a4a4a;
    }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
  }

  .toolbar {
    background: var(--toolbar-bg);
    border-bottom: 1px solid var(--toolbar-border);
    padding: 12px 20px;
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .toolbar a, .toolbar button {
    color: var(--text);
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 6px;
    background: var(--button-bg);
    border: none;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .toolbar a:hover, .toolbar button:hover {
    background: var(--button-hover);
  }

  .container {
    max-width: 680px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 8px;
    line-height: 1.2;
  }

  .meta {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 32px;
  }

  .article-content {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 18px;
    line-height: 1.7;
  }

  .article-content p {
    margin-bottom: 1.4em;
  }

  .article-content img {
    max-width: 100%;
    height: auto;
    margin: 1.5em 0;
    border-radius: 4px;
  }

  .article-content a {
    color: var(--link);
    text-decoration: underline;
  }

  .article-content a:hover {
    color: var(--link-hover);
  }

  .article-list {
    list-style: none;
  }

  .article-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .article-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .article-card h2 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .article-card h2 a {
    color: var(--text);
    text-decoration: none;
  }

  .article-card h2 a:hover {
    color: var(--link);
  }

  .article-card .meta {
    margin-bottom: 12px;
  }

  .article-card .excerpt {
    color: var(--text-secondary);
    font-size: 15px;
    line-height: 1.5;
  }

  .add-url {
    margin-bottom: 32px;
  }

  .add-url form {
    display: flex;
    gap: 12px;
  }

  .add-url input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid var(--card-border);
    border-radius: 6px;
    background: var(--card-bg);
    color: var(--text);
    font-size: 16px;
  }

  .add-url button {
    padding: 12px 24px;
    background: var(--link);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .add-url button:hover {
    background: var(--link-hover);
  }

  @media (max-width: 768px) {
    .container {
      padding: 24px 16px;
    }

    h1 {
      font-size: 28px;
    }

    .article-content {
      font-size: 17px;
    }

    .add-url form {
      flex-direction: column;
    }
  }
`;
