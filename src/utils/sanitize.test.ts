import { describe, it, expect } from 'vitest';
import { sanitizeArticleContent } from './sanitize.js';

describe('sanitizeArticleContent', () => {
  describe('XSS Protection - Script Tags', () => {
    it('should remove script tags from HTML', () => {
      const input = '<p>Text</p><script>alert("XSS")</script><p>More text</p>';
      const output = sanitizeArticleContent(input);

      expect(output).not.toContain('<script>');
      expect(output).not.toContain('alert');
      expect(output).toContain('<p>Text</p>');
      expect(output).toContain('<p>More text</p>');
    });

    it('should remove external script references', () => {
      const input = '<p>Content</p><script src="http://evil.com/xss.js"></script>';
      const output = sanitizeArticleContent(input);

      expect(output).not.toContain('<script');
      expect(output).not.toContain('evil.com');
    });
  });

  describe('XSS Protection - Event Handlers', () => {
    it('should remove onerror event handlers', () => {
      const input = '<img src="x" onerror="alert(\'XSS\')">';
      const output = sanitizeArticleContent(input);

      expect(output).not.toContain('onerror');
      expect(output).not.toContain('alert');
    });

    it('should remove onclick event handlers', () => {
      const input = '<a href="#" onclick="alert(\'XSS\')">Click</a>';
      const output = sanitizeArticleContent(input);

      expect(output).not.toContain('onclick');
      expect(output).not.toContain('alert');
    });

    it('should remove onload event handlers', () => {
      const input = '<body onload="alert(\'XSS\')">Content</body>';
      const output = sanitizeArticleContent(input);

      expect(output).not.toContain('onload');
      expect(output).not.toContain('alert');
    });
  });

  describe('XSS Protection - JavaScript Protocol', () => {
    it('should remove javascript: protocol from href', () => {
      const input = '<a href="javascript:alert(\'XSS\')">Click</a>';
      const output = sanitizeArticleContent(input);

      expect(output).not.toContain('javascript:');
      expect(output).not.toContain('alert');
    });

    it('should remove javascript: protocol from src', () => {
      const input = '<iframe src="javascript:alert(\'XSS\')"></iframe>';
      const output = sanitizeArticleContent(input);

      expect(output).not.toContain('javascript:');
      expect(output).not.toContain('alert');
    });
  });

  describe('XSS Protection - SVG Attacks', () => {
    it('should remove scripts from SVG elements', () => {
      const input = '<svg><script>alert("XSS")</script></svg>';
      const output = sanitizeArticleContent(input);

      expect(output).not.toContain('<script>');
      expect(output).not.toContain('alert');
    });

    it('should remove SVG event handlers', () => {
      const input = '<svg onload="alert(\'XSS\')"></svg>';
      const output = sanitizeArticleContent(input);

      expect(output).not.toContain('onload');
      expect(output).not.toContain('alert');
    });
  });

  describe('Legitimate HTML Preservation', () => {
    it('should preserve headings', () => {
      const input = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>';
      const output = sanitizeArticleContent(input);

      expect(output).toContain('<h1>Title</h1>');
      expect(output).toContain('<h2>Subtitle</h2>');
      expect(output).toContain('<h3>Section</h3>');
    });

    it('should preserve paragraphs and text formatting', () => {
      const input = '<p>Text with <strong>bold</strong> and <em>italic</em></p>';
      const output = sanitizeArticleContent(input);

      expect(output).toContain('<p>');
      expect(output).toContain('<strong>bold</strong>');
      expect(output).toContain('<em>italic</em>');
    });

    it('should preserve links with valid URLs', () => {
      const input = '<a href="https://example.com">Link</a>';
      const output = sanitizeArticleContent(input);

      expect(output).toContain('href="https://example.com"');
      expect(output).toContain('>Link</a>');
    });

    it('should preserve images with valid URLs', () => {
      const input = '<img src="https://example.com/pic.jpg" alt="Picture">';
      const output = sanitizeArticleContent(input);

      expect(output).toContain('src="https://example.com/pic.jpg"');
      expect(output).toContain('alt="Picture"');
    });

    it('should preserve lists', () => {
      const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const output = sanitizeArticleContent(input);

      expect(output).toContain('<ul>');
      expect(output).toContain('<li>Item 1</li>');
      expect(output).toContain('<li>Item 2</li>');
    });

    it('should preserve code blocks', () => {
      const input = '<pre><code>const x = 10;</code></pre>';
      const output = sanitizeArticleContent(input);

      expect(output).toContain('<pre>');
      expect(output).toContain('<code>');
      expect(output).toContain('const x = 10;');
    });

    it('should preserve blockquotes', () => {
      const input = '<blockquote>Quote text</blockquote>';
      const output = sanitizeArticleContent(input);

      expect(output).toContain('<blockquote>');
      expect(output).toContain('Quote text');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const output = sanitizeArticleContent('');
      expect(output).toBe('');
    });

    it('should handle plain text without HTML', () => {
      const input = 'Plain text content';
      const output = sanitizeArticleContent(input);
      expect(output).toBe('Plain text content');
    });

    it('should handle malformed HTML gracefully', () => {
      const input = '<p>Unclosed tag<div>Nested<p>Broken';
      const output = sanitizeArticleContent(input);
      expect(output).toBeTruthy();
    });
  });

  describe('Performance Requirements', () => {
    it('should complete within 50ms for typical content', () => {
      const input = '<p>' + 'Lorem ipsum '.repeat(100) + '</p>'.repeat(10);

      const start = performance.now();
      sanitizeArticleContent(input);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  describe('Idempotence', () => {
    it('should be idempotent - sanitize(sanitize(x)) = sanitize(x)', () => {
      const input = '<p>Text</p><script>alert("XSS")</script>';
      const first = sanitizeArticleContent(input);
      const second = sanitizeArticleContent(first);

      expect(first).toBe(second);
    });
  });
});
