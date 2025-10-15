/**
 * Content extraction service using @mozilla/readability and linkedom
 * Extracts clean article content from HTML pages
 */

import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import type { ExtractedContent } from '../types.js';

/**
 * Check if URL is Naver Blog
 */
function isNaverBlog(url: string): boolean {
  return url.includes('blog.naver.com');
}

/**
 * Check if URL is Brunch
 */
function isBrunch(url: string): boolean {
  return url.includes('brunch.co.kr');
}

/**
 * Remove auto_login parameter from Brunch URLs to avoid redirect loops
 */
function cleanBrunchUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.delete('auto_login');
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Convert Naver Blog URL to PostView URL for direct content access
 */
function convertToNaverPostViewUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // Already a PostView URL
    if (url.includes('PostView.naver')) {
      return url;
    }

    // Extract blog ID and log number from path
    // Format: /blogId/logNo or /PostView.naver?blogId=...&logNo=...
    const pathMatch = urlObj.pathname.match(/\/([^\/]+)\/(\d+)/);
    if (pathMatch) {
      const [, blogId, logNo] = pathMatch;
      return `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`;
    }

    // Try to extract from query parameters
    const blogId = urlObj.searchParams.get('blogId');
    const logNo = urlObj.searchParams.get('logNo');
    if (blogId && logNo) {
      return `https://blog.naver.com/PostView.naver?blogId=${blogId}&logNo=${logNo}`;
    }

    return url;
  } catch {
    return url;
  }
}

/**
 * Extract content from Naver Blog (special handling)
 */
async function extractNaverBlogContent(url: string, document: any): Promise<ExtractedContent | null> {
  // Try to find main content area
  const selectors = [
    '#postViewArea',           // Main content container
    '.se-main-container',      // Smart Editor content
    '#viewTypeSelector',       // Alternative content area
    '.post-view',              // Post view container
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim().length > 100) {
      const content = element.innerHTML || '';
      const text = element.textContent || '';
      const excerpt = truncateExcerpt(text);

      const titleElement = document.querySelector('meta[property="og:title"]')
        || document.querySelector('.pcol1 h3')
        || document.querySelector('.se-title-text')
        || document.querySelector('title');
      const title = titleElement?.getAttribute('content') || titleElement?.textContent || 'Untitled';

      const wordCount = estimateWordCount(text);
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      const publishedTime = parsePublishedTime(document);

      return {
        title: title.trim(),
        content: content,
        excerpt: excerpt,
        author: null,
        siteName: 'blog.naver.com',
        publishedTime,
        wordCount,
        readingTime,
      };
    }
  }

  return null;
}

/**
 * Extract article content from URL
 */
export async function extractContent(url: string): Promise<ExtractedContent> {
  try {
    // Clean Brunch URLs to avoid login redirect loops
    if (isBrunch(url)) {
      url = cleanBrunchUrl(url);
    }

    // Fetch HTML with proper headers
    // For Brunch, use manual redirect to avoid login loops
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      redirect: isBrunch(url) ? 'manual' : 'follow',
    });

    // Handle redirects for Brunch (3xx responses with manual redirect)
    if (isBrunch(url) && response.status >= 300 && response.status < 400) {
      throw new Error('Brunch article requires login. Please try a different URL or access directly.');
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Parse HTML with linkedom (Cloudflare Workers compatible)
    const { document } = parseHTML(html);

    // Special handling for Naver Blog
    if (isNaverBlog(url)) {
      const postViewUrl = convertToNaverPostViewUrl(url);
      if (postViewUrl !== url) {
        const postViewResponse = await fetch(postViewUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });
        if (postViewResponse.ok) {
          const postViewHtml = await postViewResponse.text();
          const { document: postViewDoc } = parseHTML(postViewHtml);
          const naverContent = await extractNaverBlogContent(postViewUrl, postViewDoc);
          if (naverContent) {
            return naverContent;
          }
        }
      }

      // Fallback: try extracting from original document
      const naverContent = await extractNaverBlogContent(url, document);
      if (naverContent) {
        return naverContent;
      }
    }

    // Extract content with Readability
    const reader = new Readability(document, {
      keepClasses: false,
      charThreshold: 100, // Lower threshold for better extraction
    });

    const article = reader.parse();

    if (!article) {
      throw new Error('Failed to parse article content - no readable content found');
    }

    // Calculate reading time (average 200 words per minute)
    const wordCount = estimateWordCount(article.textContent);
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const publishedTime = parsePublishedTime(document);

    return {
      title: article.title || 'Untitled',
      content: article.content || '',
      excerpt: truncateExcerpt(article.excerpt || article.textContent || ''),
      author: article.byline || null,
      siteName: article.siteName || extractDomain(url),
      publishedTime,
      wordCount,
      readingTime,
    };
  } catch (error) {
    console.error('Content extraction failed:', error);
    throw new Error(`Failed to extract content: ${(error as Error).message}`);
  }
}

/**
 * Parse published time from meta tags
 */
function parsePublishedTime(document: any): string | null {
  const selectors = [
    'meta[property="article:published_time"]',
    'meta[property="og:article:published_time"]',
    'meta[name="citation_date"]',
    'meta[name="date"]',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const content = element.getAttribute('content');
      if (content && !isNaN(new Date(content).getTime())) {
        return new Date(content).toISOString();
      }
    }
  }

  return null;
}

/**
 * Estimate word count from text
 */
function estimateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Truncate excerpt to maximum 300 characters
 */
function truncateExcerpt(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= 300) return cleaned;
  return cleaned.slice(0, 297) + '...';
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return 'Unknown';
  }
}
