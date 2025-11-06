/**
 * Tests for content extraction service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractContent } from './extractor.js';

// Mock Naver Blog HTML
const naverBlogHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="테스트 블로그 글 제목">
  <title>네이버 블로그 | 테스트</title>
</head>
<body>
  <div id="postViewArea">
    <h3>테스트 블로그 글 제목</h3>
    <p>이것은 네이버 블로그 테스트 콘텐츠입니다. 충분한 길이의 본문이 있어야 합니다. </p>
    <p>여러 문단으로 구성된 긴 글입니다. 최소 100자 이상이어야 추출이 잘 됩니다.</p>
    <p>추가 문단을 더 넣어서 충분한 콘텐츠 길이를 만듭니다.</p>
  </div>
</body>
</html>
`;

// Mock standard blog HTML
const standardBlogHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Standard Blog Post</title>
</head>
<body>
  <article>
    <h1>Test Article Title</h1>
    <p>This is a test article with enough content to be extracted by Readability.</p>
    <p>Multiple paragraphs ensure proper extraction works correctly.</p>
    <p>We need sufficient text length for the parser to identify this as main content.</p>
  </article>
</body>
</html>
`;

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('Content Extraction', () => {
  it('should extract content from Naver Blog', async () => {
    // Mock fetch to return Naver Blog HTML
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => naverBlogHtml,
    } as Response);

    const result = await extractContent('https://blog.naver.com/test/123');

    expect(result.title).toBe('테스트 블로그 글 제목');
    expect(result.siteName).toBe('blog.naver.com');
    expect(result.content).toContain('네이버 블로그 테스트 콘텐츠');
    expect(result.excerpt).toContain('네이버 블로그 테스트 콘텐츠');
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.readingTime).toBeGreaterThan(0);
  });

  it('should extract content from standard blog with Readability', async () => {
    // Mock fetch to return standard blog HTML
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => standardBlogHtml,
    } as Response);

    const result = await extractContent('https://example.com/article');

    // Readability uses <title> tag by default
    expect(result.title).toBe('Standard Blog Post');
    expect(result.content).toContain('test article with enough content');
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.readingTime).toBeGreaterThan(0);
  });

  it('should throw error for HTTP error response', async () => {
    // Mock fetch to return 404
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    await expect(extractContent('https://example.com/notfound')).rejects.toThrow('HTTP 404');
  });

  it('should throw error when content extraction fails', async () => {
    // Mock fetch to return empty HTML
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '<html><body></body></html>',
    } as Response);

    await expect(extractContent('https://example.com/empty')).rejects.toThrow();
  });

  it('should calculate reading time correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => naverBlogHtml,
    } as Response);

    const result = await extractContent('https://blog.naver.com/test/123');

    // Reading time should be at least 1 minute
    expect(result.readingTime).toBeGreaterThanOrEqual(1);
    // Reading time should be calculated based on word count / 200
    expect(result.readingTime).toBe(Math.max(1, Math.ceil(result.wordCount / 200)));
  });
});

describe('Naver Blog Special Handling', () => {
  it('should detect Naver Blog URL', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => naverBlogHtml,
    } as Response);

    const result = await extractContent('https://blog.naver.com/bizucafe/223886283493');

    expect(result.siteName).toBe('blog.naver.com');
  });

  it('should extract title from og:title meta tag for Naver Blog', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => naverBlogHtml,
    } as Response);

    const result = await extractContent('https://blog.naver.com/test/123');

    expect(result.title).toBe('테스트 블로그 글 제목');
  });

  it('should extract content from #postViewArea for Naver Blog', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => naverBlogHtml,
    } as Response);

    const result = await extractContent('https://blog.naver.com/test/123');

    expect(result.content).toContain('네이버 블로그 테스트 콘텐츠');
    expect(result.content).toContain('충분한 길이의 본문');
  });
});
