# Data Model: Contentful Migration

**Feature**: Contentful Migration  
**Date**: 2025-12-27

## Entity: Tip

Represents a single piece of content (tip) displayed on the site.

### Attributes

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | string | Yes | Non-empty | Display title of the tip |
| `slug` | string | Yes | Unique, URL-safe | URL identifier for routing (e.g., "03-site-builder") |
| `tipNumber` | number | Yes | Positive integer | Ordering value for list display |
| `body` | Rich Text Document | Yes | Non-empty | Formatted content (headings, lists, links, etc.) |

### Relationships

None. Tips are independent entities with no relationships to other content.

### Validation Rules

1. **Slug uniqueness**: Each tip must have a unique slug across all tips
2. **Slug format**: Must be URL-safe (alphanumeric, hyphens, underscores only)
3. **Slug conflicts**: Must not conflict with Next.js system routes (e.g., "api", "_next")
4. **tipNumber ordering**: Used for sorting, but values need not be sequential
5. **Required fields**: All four fields must be present and non-empty

### State Transitions

N/A - Tips are static content with no state machine. Published/unpublished state handled by Contentful, not application logic.

### TypeScript Interface

```typescript
import { Document } from '@contentful/rich-text-types';

export interface Tip {
  title: string;
  slug: string;
  tipNumber: number;
  body: Document; // Contentful Rich Text Document structure
}
```

### Contentful Content Model

**Content Type ID**: `tip`

**Fields**:
- `title`: Short text, required
- `slug`: Short text, required, unique
- `tipNumber`: Integer, required
- `body`: Rich text, required

### Data Flow

1. **Content Creation**: Content editor creates/edits tip in Contentful WYSIWYG interface
2. **Content Fetching**: Next.js page component calls adapter function (`getAllTips()` or `getTipBySlug()`)
3. **Adapter Layer**: `lib/content/tips.ts` fetches from Contentful API, transforms to `Tip` interface
4. **Rendering**: React components receive `Tip` objects, render using Rich Text renderer

### Error Cases

- **Missing tip**: `getTipBySlug()` returns `null` → 404 page
- **API unavailable**: Adapter throws error → Simple error message displayed
- **Malformed data**: Adapter validates and filters invalid tips → Only valid tips displayed

