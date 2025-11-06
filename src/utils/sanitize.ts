import { DOMParser } from 'linkedom';

/**
 * Allowed HTML tags for article content
 * Security: Whitelist approach - only known-safe tags are permitted
 */
const ALLOWED_TAGS = [
  // Headings
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  // Text formatting
  'p',
  'br',
  'strong',
  'em',
  'b',
  'i',
  'u',
  's',
  // Lists
  'ul',
  'ol',
  'li',
  // Links and media
  'a',
  'img',
  // Code and quotes
  'code',
  'pre',
  'blockquote',
  // Semantic elements
  'article',
  'section',
  'aside',
  'figure',
  'figcaption',
];

/**
 * Allowed HTML attributes for article content
 * Security: Whitelist approach - only known-safe attributes are permitted
 */
const ALLOWED_ATTR = [
  'href', // Links
  'src', // Images
  'alt', // Image accessibility
  'title', // Tooltips
  'class', // Styling (CSS classes only, no inline styles)
];

/**
 * Allowed URL schemes for href/src attributes
 * Security: Block javascript:, vbscript:, data: protocols
 */
const ALLOWED_URI_REGEXP =
  /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

/**
 * Sanitize HTML content to remove XSS vectors while preserving legitimate article formatting
 *
 * @param html - Raw HTML content from article extraction (may contain unsafe scripts)
 * @returns Sanitized HTML safe to render in browser (all XSS vectors removed)
 *
 * @security
 * - Removes script tags, event handlers, javascript: protocols
 * - Uses DOM-based whitelist approach
 * - Idempotent: sanitize(sanitize(x)) = sanitize(x)
 *
 * @performance
 * - Target: <50ms for typical articles (<500KB)
 * - Uses linkedom for Workers-compatible DOM parsing
 *
 * @example
 * ```typescript
 * const dirty = '<p>Text</p><script>alert("XSS")</script>';
 * const clean = sanitizeArticleContent(dirty);
 * // Result: '<p>Text</p>'
 * ```
 */
export function sanitizeArticleContent(html: string): string {
  if (!html || html.trim() === '') {
    return '';
  }

  try {
    // Parse HTML with linkedom
    const parser = new DOMParser();
    // Wrap content in a proper HTML structure
    const wrappedHtml = `<!DOCTYPE html><html><body>${html}</body></html>`;
    const doc = parser.parseFromString(wrappedHtml, 'text/html');

    // Recursively sanitize the document body
    if (doc.body) {
      sanitizeNode(doc.body);
      return doc.body.innerHTML;
    }

    return '';
  } catch (error) {
    // Defensive programming: Return empty string on critical failure
    // rather than potentially unsafe content
    console.error('Sanitization failed', { error, htmlLength: html?.length });
    return '';
  }
}

/**
 * Recursively sanitize a DOM node by removing disallowed tags and attributes
 */
function sanitizeNode(node: any): void {
  // Process child nodes first (depth-first)
  const childNodes = Array.from(node.childNodes);
  for (const child of childNodes) {
    const childNode = child as any;
    if (childNode.nodeType === 1) {
      // Element node
      const element = child as any;
      const tagName = element.tagName.toLowerCase();

      // Remove disallowed tags
      if (!ALLOWED_TAGS.includes(tagName)) {
        element.remove();
        continue;
      }

      // Remove disallowed attributes
      const attributes = Array.from(element.attributes);
      for (const attr of attributes) {
        const attribute = attr as any;
        const attrName = attribute.name.toLowerCase();

        // Remove event handlers (onclick, onerror, etc.)
        if (attrName.startsWith('on')) {
          element.removeAttribute(attribute.name);
          continue;
        }

        // Remove disallowed attributes
        if (!ALLOWED_ATTR.includes(attrName)) {
          element.removeAttribute(attribute.name);
          continue;
        }

        // Validate URLs in href and src attributes
        if (attrName === 'href' || attrName === 'src') {
          const value = attribute.value.trim().toLowerCase();

          // Block javascript:, vbscript:, data: protocols
          if (
            value.startsWith('javascript:') ||
            value.startsWith('vbscript:') ||
            value.startsWith('data:')
          ) {
            element.removeAttribute(attribute.name);
            continue;
          }

          // Validate URL scheme
          if (!ALLOWED_URI_REGEXP.test(attribute.value)) {
            element.removeAttribute(attribute.name);
            continue;
          }
        }
      }

      // Recursively sanitize children
      sanitizeNode(element);
    }
  }
}
