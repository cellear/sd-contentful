# Learning Contentful

This document tracks my journey learning Contentful CMS as I migrate Simplify Drupal to use it.

## What is Contentful?

Contentful is a headless CMS (Content Management System) that provides:
- Content modeling via web UI
- REST/GraphQL APIs for content delivery
- Rich text editor (WYSIWYG)
- Free tier available

## My Learning Journey

**Work Packages**: WP01 (Project Setup), WP02 (Adapter Layer), WP03 (List View), WP04 (Detail View + Images)

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

### WP04: Image Support (2025-12-30)

**What I learned adding image support:**

#### Image Field Structure

Contentful stores images as **Asset** references. When you query entries with `include: 2`, linked assets are included in the response:

```typescript
{
  image: {
    sys: { id: "...", type: "Asset" },
    fields: {
      file: {
        url: "//images.ctfassets.net/space/asset-id/filename.jpg"
      }
    }
  }
}
```

**Key points:**
- Image URLs from Contentful start with `//` (protocol-relative)
- Need to convert to `https://` for use in `<img>` tags
- Assets can be fully included (with fields) or just linked (sys.id only)
- If just linked, need to resolve from `response.includes.Asset` array

#### Extracting Image URLs

```typescript
function extractImageUrl(image, includes) {
  // If asset is fully included (has fields)
  if (image.fields?.file?.url) {
    const url = image.fields.file.url;
    return url.startsWith('//') ? `https:${url}` : url;
  }
  
  // If asset is just a link, resolve from includes
  if (image.sys?.id && includes?.Asset) {
    const asset = includes.Asset.find(a => a.sys.id === image.sys.id);
    if (asset?.fields?.file?.url) {
      const url = asset.fields.file.url;
      return url.startsWith('//') ? `https:${url}` : url;
    }
  }
  
  return undefined;
}
```

#### Querying with Assets

```typescript
const response = await client.getEntries({
  content_type: "tip",
  include: 2, // Include linked assets (images) in response
});
```

**Important**: Without `include: 2`, image assets won't be included in the response, even if the entry has an image field set.

#### Publishing Requirements

- Image field must be added to content type (and content type saved)
- Image must be uploaded to Contentful Media library
- Image must be linked to the entry's image field
- **Entry must be PUBLISHED** (not just saved) for image to appear in API response

**Gotcha**: If you add an image to an entry but don't republish it, the image won't appear in the Delivery API response, even though it shows in the Contentful UI.

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

## Migration Steps

- [x] Export tips from Drupal (CSV format) - Completed 2025-12-30
- [x] Map Drupal fields to Contentful fields - Completed 2025-12-30
- [x] Import into Contentful - **Custom script created** (Contentful has no built-in CSV import)
- [x] Verify all 31 tips imported correctly - All 31 tips + 26 images successfully imported

### WP05: Content Import from Drupal (2025-12-30)

**What I learned importing 31 tips:**

#### CSV Import Not Available in Web UI
- **Key Finding**: Contentful's web UI does **not** have a built-in CSV import feature
- We had to write our own import script using the Management API
- This is a common need, but Contentful expects you to use their API or third-party tools

#### Management API vs Delivery API
- **Management API token** (`CFPAT-...`) - Used for creating/editing content via API
- **Delivery API token** - Used for reading published content (what Next.js uses)
- These are completely different tokens with different permissions
- Management API token is found in Settings → API keys → "Content Management API - access token"

#### Asset Upload Process
```javascript
// 1. Create asset from file buffer
const asset = await environment.createAssetFromFiles({
  fields: {
    title: { 'en-US': fileName },
    file: {
      'en-US': {
        contentType: 'image/png',
        fileName: fileName,
        file: fileBuffer
      }
    }
  }
});

// 2. Process asset (required before publishing)
await asset.processForAllLocales();

// 3. Wait for processing to complete
// (check asset.fields.file exists)

// 4. Publish asset
await asset.publish();
```

**Key points:**
- `createAssetFromFiles` handles the upload automatically (no separate upload step needed)
- Assets must be processed before publishing
- Processing can take a few seconds - need to poll/wait
- Check for existing assets by filename to avoid duplicates

#### Entry Update Workflow
When updating published entries:
1. Fetch latest version of entry
2. Unpublish if published (required to update)
3. Fetch again after unpublishing (version changes)
4. Update fields
5. Save entry
6. Fetch again after update (version changes)
7. Publish if it was published before

**Why**: Contentful uses optimistic locking with version numbers. Each update increments the version, so you must fetch the latest version before each operation to avoid 409 conflicts.

#### Rich Text Conversion
- Contentful stores rich text as structured JSON documents (not HTML)
- We converted plain text to Rich Text Document format:
  ```javascript
  {
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: 'Text content',
            marks: [],
            data: {}
          }
        ]
      }
    ]
  }
  ```
- For HTML content, would need a library like `@contentful/rich-text-html-renderer` in reverse, or manual parsing

#### Import Script Architecture
- Created `import-to-contentful.js` using `contentful-management` SDK
- Reads CSV, uploads images, creates entries, converts body text
- Handles errors gracefully (skips existing entries, logs failures)
- Rate limiting: Added 500ms delay between operations to avoid API limits

**Key Insight**: Contentful's API is powerful but requires careful version management. The Management API is essential for bulk operations that aren't available in the web UI.

## Questions / Unresolved

- What's the rate limit on free tier? (We didn't hit it with 31 tips + images)
- How to convert HTML from Drupal to Contentful Rich Text format automatically? (We used plain text conversion for now)

## Resources

- Contentful Docs: https://www.contentful.com/developers/docs/
- Contentful SDK: https://github.com/contentful/contentful.js
- Rich Text Renderer: https://github.com/contentful/rich-text/tree/master/packages/rich-text-react-renderer

