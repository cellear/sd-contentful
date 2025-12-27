# Contracts: Contentful Migration

**Feature**: Contentful Migration  
**Date**: 2025-12-27

## Adapter Interface Contract

The content adapter layer exposes a simple interface that abstracts Contentful API access. This contract ensures the UI remains decoupled from the CMS implementation.

### Function Signatures

```typescript
// lib/content/tips.ts

/**
 * Retrieves all tips ordered by tipNumber in ascending order.
 * @returns Promise resolving to array of Tip objects
 * @throws Error with simple message if Contentful API unavailable
 */
export async function getAllTips(): Promise<Tip[]>

/**
 * Retrieves a single tip by its slug.
 * @param slug - The URL-safe slug identifier (e.g., "03-site-builder")
 * @returns Promise resolving to Tip object or null if not found
 * @throws Error with simple message if Contentful API unavailable
 */
export async function getTipBySlug(slug: string): Promise<Tip | null>
```

### Type Contract

```typescript
interface Tip {
  title: string;
  slug: string;
  tipNumber: number;
  body: Document; // Contentful Rich Text Document
}
```

### Error Handling Contract

- **API Unavailable**: Functions throw Error with message "Contentful is down!" (simple, no retry logic)
- **Not Found**: `getTipBySlug()` returns `null` (not an error)
- **Invalid Data**: Adapter filters out tips with missing required fields (silently, no error)

### Implementation Notes

- Functions are pure (no side effects)
- Functions are async (return Promises)
- Functions handle all Contentful-specific logic internally
- UI components must only call these two functions, never Contentful API directly

