/**
 * Shared CSS styles for Reader application
 * Safari Reader-inspired design with dark mode support
 */

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --bg: #f8f9fa;
    --text: #212529;
    --text-secondary: #6c757d;
    --toolbar-bg: #ffffff;
    --toolbar-border: #dee2e6;
    --card-bg: #ffffff;
    --card-border: #dee2e6;
    --link: #007bff;
    --link-hover: #0056b3;
    --button-bg: #e9ecef;
    --button-hover: #d3d9df;
  }

  /* Manual light theme selection */
  :root[data-theme="light"] {
    --bg: #f8f9fa;
    --text: #212529;
    --text-secondary: #6c757d;
    --toolbar-bg: #ffffff;
    --toolbar-border: #dee2e6;
    --card-bg: #ffffff;
    --card-border: #dee2e6;
    --link: #007bff;
    --link-hover: #0056b3;
    --button-bg: #e9ecef;
    --button-hover: #d3d9df;
  }

  /* Manual dark theme selection */
  :root[data-theme="dark"] {
    --bg: #121212;
    --text: #e9ecef;
    --text-secondary: #adb5bd;
    --toolbar-bg: #1c1c1c;
    --toolbar-border: #343a40;
    --card-bg: #1c1c1c;
    --card-border: #343a40;
    --link: #80bfff;
    --link-hover: #a8d8ff;
    --button-bg: #343a40;
    --button-hover: #495057;
  }

  /* Auto mode: system preference (only when no data-theme attribute) */
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
      --bg: #121212;
      --text: #e9ecef;
      --text-secondary: #adb5bd;
      --toolbar-bg: #1c1c1c;
      --toolbar-border: #343a40;
      --card-bg: #1c1c1c;
      --card-border: #343a40;
      --link: #80bfff;
      --link-hover: #a8d8ff;
      --button-bg: #343a40;
      --button-hover: #495057;
    }
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
  }
`;

const toolbarStyles = `
  .toolbar {
    background: var(--toolbar-bg);
    border-bottom: 1px solid var(--toolbar-border);
    padding: 16px 24px;
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .toolbar a, .toolbar button {
    color: var(--text-secondary);
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 8px;
    background: transparent;
    border: none;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }

  .toolbar a:hover, .toolbar button:hover {
    background: var(--button-bg);
    color: var(--text);
  }

  .toolbar a.active {
    color: var(--link);
    font-weight: 600;
  }
`;

const containerStyles = `
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 48px 24px;
  }

  @media (max-width: 768px) {
    .container {
      padding: 32px 16px;
    }
  }
`;

const articleStyles = `
  h1 {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 16px;
    line-height: 1.3;
  }

  .meta {
    color: var(--text-secondary);
    font-size: 16px;
    margin-bottom: 40px;
  }

  .article-content {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 20px;
    line-height: 1.8;
  }

  .article-content p {
    margin-bottom: 1.6em;
  }

  .article-content img {
    max-width: 100%;
    height: auto;
    margin: 2em 0;
    border-radius: 8px;
  }

  .article-content a {
    color: var(--link);
    text-decoration: underline;
  }

  .article-content a:hover {
    color: var(--link-hover);
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 32px;
    }

    .article-content {
      font-size: 18px;
    }
  }
`;

const articleListStyles = `
  .article-list {
    list-style: none;
  }

  .article-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .article-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .article-card h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .article-card h2 a {
    color: var(--text);
    text-decoration: none;
  }

  .article-card h2 a:hover {
    color: var(--link);
  }

  .article-card .meta {
    margin-bottom: 16px;
  }

  .article-card .excerpt {
    color: var(--text-secondary);
    font-size: 16px;
    line-height: 1.6;
  }
`;

const addUrlStyles = `
  .add-url {
    margin-bottom: 40px;
  }

  .add-url form {
    display: flex;
    gap: 16px;
  }

  .add-url input {
    flex: 1;
    padding: 16px 20px;
    border: 1px solid var(--card-border);
    border-radius: 8px;
    background: var(--card-bg);
    color: var(--text);
    font-size: 18px;
  }

  .add-url button {
    padding: 16px 28px;
    background: var(--link);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .add-url button:hover {
    background: var(--link-hover);
  }

  @media (max-width: 768px) {
    .add-url form {
      flex-direction: column;
    }
  }
`;

export const styles = `
  ${globalStyles}
  ${toolbarStyles}
  ${containerStyles}
  ${articleStyles}
  ${articleListStyles}
  ${addUrlStyles}
`;
