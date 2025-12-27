# Research: Contentful Migration

**Feature**: Contentful Migration  
**Date**: 2025-12-27

## Research Questions & Findings

### 1. Next.js App Router with SSR for Contentful Integration

**Decision**: Use Next.js App Router with Server-Side Rendering (SSR) via `async` page components that fetch from Contentful adapter.

**Rationale**: 
- SSR chosen for simplicity and learning value (user wants to see rendering steps)
- No build step complexity, content always fresh
- Acceptable performance for low-traffic portfolio site
- Aligns with simplicity principle

**Alternatives Considered**:
- **SSG (Static Site Generation)**: Faster but requires rebuilds for content updates, adds build complexity
- **ISR (Incremental Static Regeneration)**: Good balance but adds revalidation complexity
- **Client-Side Rendering**: Simpler but worse SEO and initial load performance

**Implementation Pattern**:
```typescript
// app/page.tsx
export default async function HomePage() {
  const tips = await getAllTips();
  return <TipList tips={tips} />;
}
```

### 2. Contentful SDK and Rich Text Rendering

**Decision**: Use `contentful` npm package for API access and `@contentful/rich-text-react-renderer` for rendering rich text content.

**Rationale**:
- Official Contentful packages, well-maintained
- Rich text renderer handles Contentful's document structure correctly
- Simple API, aligns with readability goals

**Alternatives Considered**:
- **Direct REST API calls**: More control but requires manual parsing of rich text documents
- **GraphQL API**: More flexible but adds query complexity

**Package Versions**:
- `contentful`: Latest stable (^10.x)
- `@contentful/rich-text-react-renderer`: Latest stable (^15.x)

### 3. Adapter Pattern Implementation

**Decision**: Create `lib/content/tips.ts` with two pure functions: `getAllTips()` and `getTipBySlug(slug)`. Functions return typed Tip objects, handle errors with simple messages.

**Rationale**:
- Enforces decoupled architecture (constitution requirement)
- Simple interface, easy to swap implementations
- Pure functions are testable and readable
- Error handling stays simple (no caching complexity)

**Implementation Structure**:
```typescript
// lib/content/tips.ts
export async function getAllTips(): Promise<Tip[]>
export async function getTipBySlug(slug: string): Promise<Tip | null>
```

**Error Handling**: Simple try/catch returning error message string or throwing for adapter to handle.

### 4. TypeScript Type Definitions

**Decision**: Define `Tip` interface matching Contentful content model, use strict TypeScript.

**Rationale**:
- Type safety catches errors early (constitution requirement)
- Self-documenting code
- IDE support improves developer experience

**Type Structure**:
```typescript
interface Tip {
  title: string;
  slug: string;
  tipNumber: number;
  body: Document; // Contentful Rich Text Document
}
```

### 5. Contentful Content Model Setup

**Decision**: Single content type "Tip" with fields: title (Short text), slug (Short text, unique), tipNumber (Integer), body (Rich Text).

**Rationale**:
- Matches existing Drupal structure
- Simple model, no relationships needed
- All fields required for data integrity

**Migration Path**: CSV import from Drupal, manual mapping of fields.

### 6. Local Development with Mock Data

**Decision**: Adapter functions can use mock/fixture data when Contentful API unavailable, enabling offline development.

**Rationale**:
- Allows development without Contentful account initially
- Faster iteration during development
- Aligns with adapter pattern (implementation can vary)

**Implementation**: Environment variable or simple flag to switch between Contentful and fixtures.

## Summary

All technical decisions prioritize simplicity and readability while meeting constitution requirements. SSR provides learning value, adapter pattern ensures decoupling, and simple error handling avoids unnecessary complexity.

