# Implementation Plan: Contentful Migration

**Branch**: `001-contentful-migration` | **Date**: 2025-12-27 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `kitty-specs/001-contentful-migration/spec.md`

## Summary

Migrate SimplifyDrupal from Drupal+React to Contentful+Next.js with a decoupled architecture. The system will display 31 tips in a list view (home page) and individual detail pages, with all content managed through Contentful's WYSIWYG interface. The architecture uses an adapter pattern to keep the UI decoupled from the CMS, enabling future CMS swaps without frontend rewrites.

**Technical Approach**: Next.js App Router with Server-Side Rendering (SSR) for simplicity and learning value. Content adapter layer abstracts Contentful API access.

## Technical Context

**Language/Version**: TypeScript (strict mode), Node.js 18+  
**Primary Dependencies**: Next.js 14+ (App Router), Contentful SDK, @contentful/rich-text-react-renderer  
**Storage**: Contentful CMS (no local database)  
**Testing**: Jest, React Testing Library (unit tests for adapter, integration tests for critical flows)  
**Target Platform**: Web (browser), Node.js server (SSR)  
**Project Type**: Web application (Next.js)  
**Performance Goals**: Page load under 2 seconds (per success criteria), acceptable for low-traffic portfolio site  
**Constraints**: Simplicity prioritized over performance optimization, readable code for learning, adapter pattern required for decoupling  
**Scale/Scope**: 31 tips total, 2 page types (list + detail), single content type, low traffic expected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Validation ✅

- **I. Decoupled Architecture**: ✅ Adapter pattern specified in requirements (FR-004, FR-005)
- **II. Simplicity Over Abstraction**: ✅ SSR chosen for simplicity over SSG complexity, simple error handling specified
- **III. Component-Driven Development**: ✅ Next.js App Router patterns will be followed
- **IV. Type Safety**: ✅ TypeScript with strict mode required
- **V. Content Authoring Standards**: ✅ Contentful WYSIWYG specified, Rich Text renderer required

**Status**: All constitution principles validated. No violations detected.

## Project Structure

### Documentation (this feature)

```
kitty-specs/001-contentful-migration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (if API contracts needed)
└── tasks.md             # Phase 2 output (/spec-kitty.tasks command - NOT created here)
```

### Source Code (repository root)

```
app/
├── page.tsx             # Home page (list view)
├── [slug]/
│   └── page.tsx          # Tip detail page (dynamic route)
└── layout.tsx            # Root layout

lib/
├── content/
│   ├── tips.ts           # Adapter layer (getAllTips, getTipBySlug)
│   └── contentful.ts     # Contentful client setup
└── types/
    └── tip.ts            # TypeScript interfaces for Tip entity

components/
├── TipList.tsx           # List view component
├── TipDetail.tsx         # Detail view component
└── ErrorMessage.tsx      # Simple error display component

public/                   # Static assets (if any)
```

**Structure Decision**: Single Next.js App Router project with adapter layer in `lib/content/`. Components are simple and focused. No complex state management needed (SSR handles data fetching).

## Complexity Tracking

*No violations - all choices align with simplicity principle*

## Parallel Work Analysis

*Single developer/agent - sequential implementation recommended for learning*

