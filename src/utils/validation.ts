/**
 * Validation utilities
 */

/**
 * Validate cursor parameter for pagination
 * @param cursor - Cursor string from query parameters
 * @returns Validated cursor or null
 */
export function validateCursor(cursor: string | null): string | null {
  if (!cursor) {
    return null;
  }

  // Cursor should be a non-empty string
  if (typeof cursor !== 'string' || cursor.trim() === '') {
    throw new Error('Invalid cursor: must be a non-empty string');
  }

  // Additional validation: cursor should be alphanumeric or base64-like
  if (!/^[A-Za-z0-9+/=_-]+$/.test(cursor)) {
    throw new Error('Invalid cursor: contains invalid characters');
  }

  return cursor;
}
