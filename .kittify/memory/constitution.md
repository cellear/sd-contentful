<!--
Sync Impact Report:
Version change: 1.0.0 → 1.1.0
Modified principles: II. Simplicity Over Abstraction (expanded to emphasize readability and simplicity as primary goals)
Added sections: (none)
Templates requiring updates: ✅ All templates align with updated principles
Follow-up TODOs: None
-->

# SD-CONTENTFUL Constitution

## Core Principles

### I. Decoupled Architecture (NON-NEGOTIABLE)

UI components MUST NOT directly fetch from Contentful or any CMS. All content access must go through an adapter layer (e.g., `lib/content/tips.ts`). This enables swapping CMS providers (Contentful → Drupal JSON:API → local fixtures) without rewriting UI code. The adapter exposes simple functions like `getAllTips()` and `getTipBySlug(slug)` that abstract away the data source.

**Rationale**: The primary goal is to keep the front end decoupled from the CMS choice, allowing future backend changes without frontend rewrites.

### II. Simplicity Over Abstraction (PRIMARY GOAL)

The end result should be as simple as we can manage. Prefer straightforward, readable solutions over over-engineered abstractions. Optimize for local development ergonomics and component clarity. Do not introduce unnecessary layers, patterns, or features beyond what's explicitly required.

**Readability Goal (Desirable)**: Code should be readable by someone who doesn't know the technologies. This is a desirable goal, not an absolute requirement. If achieving perfect readability absolutely prevents making a nice user experience, we can accept some complexity, but only if the benefit clearly justifies the cost.

**Rationale**: The project scope is intentionally limited (31 tips, list + detail views). Complexity must be justified by clear benefit. Simple, readable code is easier to maintain, debug, and understand. When choosing between a simple solution and a more complex one, default to simplicity unless the complexity provides substantial value.

### III. Component-Driven Development

UI must be cleanly componentized and optimized for visual iteration tools (e.g., Cursor Inspector). Components should be self-contained, testable, and follow Next.js App Router patterns. Prefer composition over complex inheritance hierarchies.

**Rationale**: Enables efficient visual editing and iteration, which is a primary success criterion.

### IV. Type Safety

Use TypeScript for all code. Define clear interfaces for content models and adapter functions. Avoid `any` types except where absolutely necessary (with justification).

**Rationale**: Type safety catches errors early and provides better developer experience with IDE support.

### V. Content Authoring Standards

Content MUST be editable via WYSIWYG interface in Contentful. Do not introduce Markdown-based authoring or require technical knowledge for content updates. Use Contentful's official Rich Text renderer for Next.js.

**Rationale**: Non-technical users must be able to edit content without code changes. And even very technical users often prefer reading information presented with good typography.

## Architecture Standards

### Technology Stack

- **Frontend**: Next.js (App Router), TypeScript
- **CMS**: Contentful (free tier initially)
- **Development**: Local development with `next dev`
- **Content Rendering**: Contentful Rich Text renderer for Next.js

### Adapter Pattern Implementation

- Adapter layer location: `lib/content/` directory
- Adapter functions must be pure (no side effects in UI components)
- Adapter must handle errors gracefully with simple error messages (no complex caching or retry logic unless clearly justified)
- Adapter interface must remain stable even if CMS implementation changes

### URL Stability

URLs must remain stable and slug-based. Slugs are the source of truth for routing. Do not introduce versioning or hash-based routing that breaks existing URLs.

## Development Workflow

### Code Quality

- All code must pass TypeScript strict mode
- Components must be self-documenting with clear prop interfaces
- Follow Next.js App Router conventions and patterns
- No direct CMS API calls from components (enforced by adapter pattern)
- Prefer simple error handling (e.g., "Contentful is down!") over complex fallback mechanisms unless clearly justified
- Code should be readable by developers unfamiliar with the specific technologies (desirable goal)

### Testing Requirements

- Adapter functions must have unit tests
- Critical user flows (list view, detail view) must have integration tests
- Tests should use fixtures/mocks to avoid Contentful API calls during development

### Documentation

- README must explain adapter pattern and how to swap CMS providers
- Component props must be documented via TypeScript interfaces
- Content model changes must be documented in Contentful and reflected in TypeScript types

## Governance

This constitution supersedes all other development practices. All features must comply with these principles. Amendments require:

1. Documentation of the rationale for change
2. Impact assessment on existing code
3. Update to this constitution with version bump (semantic versioning: MAJOR.MINOR.PATCH)
4. Update to dependent templates and documentation

**Compliance**: All PRs and code reviews must verify constitution compliance. The `/spec-kitty.analyze` command validates alignment with these principles.

**Version**: 1.1.0 | **Ratified**: 2025-12-27 | **Last Amended**: 2025-12-27
