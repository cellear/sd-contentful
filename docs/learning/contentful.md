# Learning Contentful

This document tracks my journey learning Contentful CMS as I migrate Simplify Drupal to use it.

## What is Contentful?

Contentful is a headless CMS (Content Management System) that provides:
- Content modeling via web UI
- REST/GraphQL APIs for content delivery
- Rich text editor (WYSIWYG)
- Free tier available

## My Learning Journey

**Work Packages**: WP01 (Project Setup - no Contentful work yet), WP02 (Adapter Layer - coming soon)

### WP01: Project Setup (2025-12-29)

**Status**: No Contentful-specific work in WP01. This work package focused on Next.js project initialization, TypeScript setup, and project structure. Contentful integration begins in WP02.

**What was prepared:**
- Environment variable template (`.env.local.example`) created with placeholders for `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN`
- TypeScript types defined (`lib/types/tip.ts`) matching our planned Contentful content model
- Project structure ready for Contentful SDK integration in WP02

### Initial Research (2025-12-27)

**What I learned from planning:**
- Contentful has official SDKs for various platforms
- Rich text content is stored as structured documents (not HTML)
- Need to use `@contentful/rich-text-react-renderer` to render in React/Next.js
- Free tier should be sufficient for low-traffic site (31 tips)

**Key concepts:**
- **Content Types**: Define the structure (like "Tip" with fields: title, slug, tipNumber, body)
- **Entries**: Individual content items (each tip is an entry)
- **Space**: A container for your content (like a database)
- **API Keys**: Space ID and Access Token needed for API access

### Content Model Design

**Our Tip content type:**
- `title` (Short text, required)
- `slug` (Short text, required, unique)
- `tipNumber` (Integer, required)
- `body` (Rich text, required)

**What I learned:**
- Content model is created in Contentful web UI
- Fields have types (Short text, Integer, Rich text, etc.)
- Rich text allows formatting (headings, lists, links) via WYSIWYG editor
- Slugs must be unique (Contentful enforces this)

### WP02: Content Adapter Layer (2025-12-29)

**What I learned implementing the adapter:**

#### Contentful SDK Setup

- Install: `npm install contentful`
- Create client: `createClient({ space, accessToken })`
- Client reads from environment variables (`.env.local`)
- Client is created once and exported as singleton

#### API Token Types (Important!)

**Content Delivery API token** - Used for reading published content (what we need)
- This is what Next.js apps use to fetch content
- Only works with published entries
- Found in Settings → API keys → "Content Delivery API - access token"

**Management API token** - Used for creating/editing content via API
- Not what we need for a read-only Next.js app
- Would cause 401 "Access token invalid" errors

**Gotcha**: When copying tokens, make sure you're copying the **Content Delivery API** token, not the Management API token!

#### Querying Content

```typescript
// Get all entries of a content type
const response = await client.getEntries({
  content_type: "tip",  // Must match Contentful content type ID exactly
});

// Get single entry by field
const response = await client.getEntries({
  content_type: "tip",
  "fields.slug": "my-slug",  // Query syntax: "fields.fieldName"
  limit: 1,
});
```

**Key points:**
- Content type ID must match exactly (case-sensitive, lowercase `tip`)
- Query fields use `"fields.fieldName"` syntax
- Response has `items` array of entries
- Each entry has `sys` (metadata) and `fields` (actual content)

#### Transforming Contentful Entries

Contentful entries have this structure:
```typescript
{
  sys: { id, type, createdAt, updatedAt, ... },
  fields: {
    title: "My Title",
    slug: "my-slug",
    tipNumber: 1,
    body: Document  // Rich Text Document
  }
}
```

Our adapter transforms this to our `Tip` interface:
- Maps `fields.title` → `title`
- Maps `fields.slug` → `slug`
- Maps `fields.tipNumber` → `tipNumber`
- Maps `fields.body` → `body` (already a Document type)

**Validation**: We filter out entries with missing required fields (silently, per contract)

#### Error Handling

- Contentful SDK throws errors for API failures (401, network errors, etc.)
- We catch and throw simple "Contentful is down!" message (per constitution)
- No retry logic, no caching - keep it simple

#### Testing

- Unit tests use mocks (no real API calls needed)
- Mock Contentful entries must match the real structure (`sys` + `fields`)
- Tests verify transformation, ordering, filtering, error handling

### WP03: End-to-End Integration (2025-12-29)

**What I learned using the adapter in the UI:**

#### Adapter Usage Pattern

- Adapter functions are called directly in Server Components (no special setup needed)
- `getAllTips()` returns a Promise, so use `await` in async components
- The adapter abstracts away all Contentful-specific details - the UI just calls `getAllTips()` and gets `Tip[]`
- This confirms the adapter pattern is working: UI doesn't know or care that data comes from Contentful

#### Content Flow

1. **Contentful** → Published entries in Contentful space
2. **Adapter** (`getAllTips()`) → Fetches, transforms, orders entries
3. **Server Component** (home page) → Calls adapter, receives `Tip[]`
4. **UI Component** (TipList) → Receives tips as props, renders them

**Key insight**: The adapter successfully isolates the CMS implementation. The UI components have no knowledge of Contentful - they just work with `Tip` objects.

#### Real-World Usage

- Adapter handles all the complexity (API calls, transformation, error handling)
- UI components stay simple and focused on presentation
- If we ever swap Contentful for another CMS, only the adapter layer changes
- This validates the decoupled architecture principle from the constitution

### API Integration

**What I learned:**
- ✅ How to use Contentful SDK (`contentful` npm package)
- ✅ How to query entries by content type
- ✅ How to transform Contentful entries to our Tip interface
- ✅ How to handle errors (API unavailable, rate limits)
- ✅ How to use the adapter in real UI components (WP03)

### Rich Text Rendering

**What I'll learn:**
- How Contentful's Rich Text Document structure works
- How to use `@contentful/rich-text-react-renderer`
- How to customize rendering (if needed)
- How formatting is preserved

## Setup Steps

- [x] Create Contentful account (WP02)
- [x] Create a Space (WP02 - "SD-CONTENTFUL")
- [x] Create Tip content type with required fields (WP02)
- [x] Get API credentials (Space ID, Access Token) (WP02)
- [x] Test API access (WP02 - adapter working!)

## Migration Steps (To Do)

- [ ] Export tips from Drupal (CSV format)
- [ ] Map Drupal fields to Contentful fields
- [ ] Import into Contentful (CSV import tool)
- [ ] Verify all 31 tips imported correctly

## Questions / Unresolved

- How does CSV import work in Contentful?
- What's the rate limit on free tier?
- How do I handle rich text conversion from Drupal to Contentful format?

## Resources

- Contentful Docs: https://www.contentful.com/developers/docs/
- Contentful SDK: https://github.com/contentful/contentful.js
- Rich Text Renderer: https://github.com/contentful/rich-text/tree/master/packages/rich-text-react-renderer

