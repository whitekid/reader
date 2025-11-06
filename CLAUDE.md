- 빌드는 make를 사용한다.

## Active Technologies
- TypeScript 5.3.3, Vanilla JavaScript (ES2020+ for client-side) (001-theme-toggle)
- localStorage (browser-native, no server-side storage) (001-theme-toggle)
- TypeScript 5.3.3 (strict mode) + linkedom v0.16.0 (001-fix-xss-security)
- Custom HTML sanitization (whitelist-based, using linkedom DOMParser) (001-fix-xss-security)
- D1 Database (SQLite-based, no schema changes required) (001-fix-xss-security)
- vitest testing framework with globals enabled (001-fix-xss-security)

## Recent Changes
- 001-theme-toggle: Added TypeScript 5.3.3, Vanilla JavaScript (ES2020+ for client-side)
- 001-fix-xss-security: Implemented XSS protection using custom linkedom-based sanitization (DOMPurify incompatible with Cloudflare Workers)

## Security Implementation

### XSS Protection (001-fix-xss-security)
- **Implementation**: Custom DOM-based whitelist sanitization in `src/utils/sanitize.ts`
- **Critical Discovery**: DOMPurify is incompatible with linkedom (returns `isSupported: undefined`)
- **Solution**: Implemented recursive DOM tree walker with whitelist approach
- **Whitelist Configuration**:
  - Allowed tags: h1-h6, p, br, strong, em, b, i, u, s, ul, ol, li, a, img, code, pre, blockquote, article, section, aside, figure, figcaption
  - Allowed attributes: href, src, alt, title, class
  - Allowed URL schemes: https:, http:, mailto: (blocks javascript:, vbscript:, data:)
- **API**: `sanitizeArticleContent(html: string): string`
- **Applied**: Article content rendering in `src/templates/reader.ts:108`
- **Testing**: 21 comprehensive tests covering XSS vectors, legitimate HTML preservation, edge cases
- **Performance**: <50ms for typical articles, idempotent operation

### Type Safety Improvements (001-fix-xss-security)
- Fixed nullable type handling in `src/services/extractor.ts:192` using nullish coalescing operator (`??`)
- Fixed vitest global types by adding "vitest/globals" to tsconfig.json
- Fixed test compatibility by replacing `global.fetch` with `globalThis.fetch` in extractor.test.ts
