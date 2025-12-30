# SimplifyDrupal → Contentful + Next.js Migration

You are working on the SimplifyDrupal project. The goal is to modernize the front end and move content to Contentful, while keeping the architecture simple and flexible.

## Context

- The existing backend is a Drupal site using the default Article content type.
- There are 31 records total ("tips"), each producing:
  - A detail page at `/[slug]` (e.g. `/03-site-builder`)
  - A listing on the home page.
- The existing React app already has:
  - A list view (`TipList`)
  - A detail view (`TipDetail`)
- The data model is simple and stable.

## Target Architecture

- **Front end**: Next.js (App Router), developed locally with `next dev`
- **CMS**: Contentful (free account)
- **Authoring**: Contentful Rich Text editor (WYSIWYG)
- **Database**: Abstracted away by Contentful (no direct SQL work)
- **Primary goal**: Enable modern component-driven UI development with strong visual editing support (e.g. Cursor Inspector).

## Content Model (Contentful)

Create a single content type: **Tip**

### Fields

- `title` — Short text, required
- `slug` — Short text, required, unique (used for routing)
- `tipNumber` — Integer, required (used for ordering)
- `body` — Rich Text, required
- `image` — Media (One file), optional but recommended (Simplify Drupal has always included images with tips)

Content will be bulk-imported (prefer CSV import) from Drupal rather than entered manually.

## Front-End Behavior

- `/` shows a list of all tips ordered by `tipNumber`
- `/[slug]` shows the full tip (title + image if present + rich text body)
- URLs must remain stable and slug-based

## Adapter Pattern Requirement

**Do not fetch Contentful directly from UI components.**

Instead:

- Create a small content adapter layer (e.g. `lib/content/tips.ts`)
- Expose exactly two functions:
  - `getAllTips()`
  - `getTipBySlug(slug)`
- The rest of the app must only call these functions.

This keeps the UI decoupled from the CMS and allows future swaps (e.g. Drupal JSON:API, local fixtures) without rewriting the front end.

## Implementation Notes

- Use Contentful's official Rich Text renderer for Next.js.
- Optimize for local development ergonomics and component clarity, not over-abstraction.
- Do not introduce Markdown-based authoring.
- Do not add extra content types or features beyond what's described.
- Keep the solution straightforward and readable.

## Primary Success Criteria

- Content is fully editable in Contentful via a WYSIWYG interface.
- The Next.js app renders list + detail pages correctly.
- The front end is cleanly componentized and Cursor-friendly for visual iteration.
- CMS choice is isolated behind the adapter layer.

---
