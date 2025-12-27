# Quickstart: Contentful Migration

**Feature**: Contentful Migration  
**Date**: 2025-12-27

## Prerequisites

- Node.js 18+ installed
- Contentful account (free tier sufficient)
- Contentful space created
- Content model "Tip" created with required fields

## Setup Steps

### 1. Install Dependencies

```bash
npm install next@latest react@latest react-dom@latest
npm install contentful @contentful/rich-text-react-renderer @contentful/rich-text-types
npm install -D typescript @types/react @types/node
```

### 2. Configure Contentful

Create `.env.local`:
```
CONTENTFUL_SPACE_ID=your-space-id
CONTENTFUL_ACCESS_TOKEN=your-access-token
```

### 3. Project Structure

```
app/
  page.tsx              # Home page (list)
  [slug]/page.tsx       # Detail page
lib/
  content/
    tips.ts             # Adapter layer
    contentful.ts        # Client setup
  types/
    tip.ts              # TypeScript types
components/
  TipList.tsx
  TipDetail.tsx
  ErrorMessage.tsx
```

### 4. Development Workflow

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
```

### 5. Testing

```bash
# Run unit tests (adapter functions)
npm test

# Run integration tests (page flows)
npm run test:integration
```

## Key Files

- **Adapter**: `lib/content/tips.ts` - Content fetching abstraction
- **Home Page**: `app/page.tsx` - Lists all tips
- **Detail Page**: `app/[slug]/page.tsx` - Shows individual tip
- **Types**: `lib/types/tip.ts` - TypeScript interfaces

## Content Migration

1. Export tips from Drupal as CSV
2. Map fields: title, slug, tipNumber, body
3. Import into Contentful via CSV import tool
4. Verify all 31 tips imported correctly

## Common Tasks

### Add a New Tip

1. Create tip in Contentful WYSIWYG interface
2. Set title, slug, tipNumber, body
3. Publish
4. Tip appears automatically (SSR fetches fresh)

### Update Existing Tip

1. Edit in Contentful
2. Publish
3. Changes visible on next page load

### Local Development Without Contentful

Set `USE_MOCK_DATA=true` in `.env.local` to use fixture data.

