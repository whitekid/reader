/**
 * Content extraction service using @mozilla/readability and linkedom
 * Extracts clean article content from HTML pages
 */

import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import type { ExtractedContent } from '../types.js';

/**
 * Extract article content from URL
 */
export async function extractContent(url: string): Promise<ExtractedContent> {
  try {
    // Fetch HTML with proper headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ReaderBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Parse HTML with linkedom (Cloudflare Workers compatible)
    const { document } = parseHTML(html);

    // Extract content with Readability
    const reader = new Readability(document, {
      keepClasses: false,
      charThreshold: 500,
    });

    const article = reader.parse();

    if (!article) {
      throw new Error('Failed to parse article content');
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
