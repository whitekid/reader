/**
 * Tests for content extraction service
 */

import { extractContent } from './extractor.js';

/**
 * Test helper to create mock fetch response
 */
function createMockResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

/**
 * Mock Naver Blog HTML
 */
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

/**
 * Mock standard blog HTML
 */
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

/**
 * Test cases for content extraction
 */
const testCases = [
  {
    name: 'Naver Blog extraction',
    url: 'https://blog.naver.com/bizucafe/223886283493',
    mockHtml: naverBlogHtml,
    expectedTitle: '테스트 블로그 글 제목',
    expectedSiteName: 'blog.naver.com',
    shouldContain: '네이버 블로그 테스트 콘텐츠',
  },
  {
    name: 'Standard blog extraction',
    url: 'https://example.com/article',
    mockHtml: standardBlogHtml,
    expectedTitle: 'Test Article Title',
    shouldContain: 'test article with enough content',
  },
  {
    name: 'URL normalization with tracking params',
    url: 'https://blog.naver.com/test/123?utm_source=twitter&trackingCode=rss',
    normalizedUrl: 'https://blog.naver.com/test/123',
  },
];

/**
 * Run tests (manual execution for now)
 */
export async function runTests() {
  console.log('🧪 Running extraction tests...\n');

  for (const test of testCases) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`  URL: ${test.url}`);

      // Note: This is a conceptual test structure
      // In actual Cloudflare Workers environment, you would need to:
      // 1. Mock the global fetch function
      // 2. Use a test framework like Vitest or Jest
      // 3. Run tests in a Node.js environment or Workers test environment

      console.log(`  ✅ Test structure defined`);
      console.log('');
    } catch (error) {
      console.log(`  ❌ Error: ${(error as Error).message}`);
      console.log('');
    }
  }
}

/**
 * Expected behavior documentation
 */
export const expectedBehavior = {
  naverBlog: {
    detection: 'URL contains "blog.naver.com"',
    selectors: ['#postViewArea', '.se-main-container', '#viewTypeSelector', '.post-view'],
    titleSource: 'meta[property="og:title"] or .pcol1 h3 or title',
    minContentLength: 100,
  },
  standardBlog: {
    parser: '@mozilla/readability',
    charThreshold: 100,
    wordCountCalculation: 'split by whitespace, 200 words per minute',
  },
  urlNormalization: {
    removedParams: [
      'utm_*', 'fbclid', 'gclid', 'twclid',
      'trackingCode', 'trackingId', 'fromRss',
      'ref', 'source', 'campaign', 'medium'
    ],
  },
};

/**
 * Integration test instructions
 */
export const integrationTestGuide = `
## Manual Integration Testing

### Test Naver Blog
1. POST /post with URL: https://blog.naver.com/bizucafe/223886283493
2. Verify title extracted correctly from og:title meta tag
3. Verify content extracted from #postViewArea
4. Verify site_name is "blog.naver.com"

### Test Standard Blog
1. POST /post with URL from standard blog platform
2. Verify Readability extraction works
3. Verify word count and reading time calculated

### Test URL Normalization
1. POST /post?url=https://example.com?utm_source=test&trackingCode=rss
2. Verify stored URL has no tracking parameters
3. Verify duplicate detection works with normalized URLs

### Test Error Handling
1. POST /post with invalid URL
2. Verify proper error message returned
3. POST /post with URL that returns 404
4. Verify HTTP error handling works
`;
