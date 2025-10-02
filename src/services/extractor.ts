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
 * Extract content from Naver Blog (special handling)
 */
function extractNaverBlogContent(document: any): { content: string; excerpt: string } | null {
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
      return { content, excerpt };
    }
  }

  return null;
}

/**
 * Extract article content from URL
 */
export async function extractContent(url: string): Promise<ExtractedContent> {
  try {
    // Fetch HTML with proper headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Parse HTML with linkedom (Cloudflare Workers compatible)
    const { document } = parseHTML(html);

    // Special handling for Naver Blog
    if (isNaverBlog(url)) {
      const naverContent = extractNaverBlogContent(document);
      if (naverContent) {
        // Extract title from meta or h3
        const titleElement = document.querySelector('meta[property="og:title"]')
          || document.querySelector('.pcol1 h3')
          || document.querySelector('title');
        const title = titleElement?.getAttribute('content') || titleElement?.textContent || 'Untitled';

        const wordCount = estimateWordCount(naverContent.excerpt);
        const readingTime = Math.max(1, Math.ceil(wordCount / 200));

        return {
          title: title.trim(),
          content: naverContent.content,
          excerpt: naverContent.excerpt,
          author: null,
          siteName: 'blog.naver.com',
          publishedTime: null,
          wordCount,
          readingTime,
        };
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

    return {
      title: article.title || 'Untitled',
      content: article.content || '',
      excerpt: truncateExcerpt(article.excerpt || article.textContent || ''),
      author: article.byline || null,
      siteName: article.siteName || extractDomain(url),
      publishedTime: null, // Can be enhanced with meta tag parsing
      wordCount,
      readingTime,
    };
  } catch (error) {
    console.error('Content extraction failed:', error);
    throw new Error(`Failed to extract content: ${(error as Error).message}`);
  }
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
