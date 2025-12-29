# Learning Contentful

This document tracks my journey learning Contentful CMS as I migrate Simplify Drupal to use it.

## What is Contentful?

Contentful is a headless CMS (Content Management System) that provides:
- Content modeling via web UI
- REST/GraphQL APIs for content delivery
- Rich text editor (WYSIWYG)
- Free tier available

## My Learning Journey

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

### API Integration

**What I'll learn during implementation:**
- How to use Contentful SDK (`contentful` npm package)
- How to query entries by content type
- How to transform Contentful entries to our Tip interface
- How to handle errors (API unavailable, rate limits)

### Rich Text Rendering

**What I'll learn:**
- How Contentful's Rich Text Document structure works
- How to use `@contentful/rich-text-react-renderer`
- How to customize rendering (if needed)
- How formatting is preserved

## Setup Steps (To Do)

- [ ] Create Contentful account
- [ ] Create a Space
- [ ] Create Tip content type with required fields
- [ ] Get API credentials (Space ID, Access Token)
- [ ] Test API access

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

