# Learning Next.js

This document tracks my journey learning Next.js as I build the Simplify Drupal frontend.

## What is Next.js?

Next.js is a React framework that provides:
- Server-side rendering (SSR)
- Static site generation (SSG)
- App Router (file-based routing)
- Built-in optimizations

## My Learning Journey

### Initial Research (2025-12-27)

**What I learned from planning:**
- Next.js has an "App Router" (newer) vs "Pages Router" (older)
- We're using App Router with Server-Side Rendering (SSR)
- SSR chosen for simplicity and learning value (want to see rendering steps)
- Pages are async server components that fetch data

**Key concepts:**
- **App Router**: File-based routing using `app/` directory
- **Server Components**: Default in App Router, run on server
- **Dynamic Routes**: `app/[slug]/page.tsx` for parameterized routes
- **Layouts**: `app/layout.tsx` wraps all pages

### Project Structure

**Our structure:**
```
app/
  page.tsx              # Home page (/) - list view
  [slug]/page.tsx       # Detail page (/[slug]) - dynamic route
  layout.tsx            # Root layout

lib/
  content/
    tips.ts             # Adapter layer
    contentful.ts       # Contentful client
  types/
    tip.ts              # TypeScript interfaces

components/
  TipList.tsx
  TipDetail.tsx
  ErrorMessage.tsx
```

**What I'll learn:**
- How to structure Next.js App Router projects
- How async server components work
- How dynamic routes handle parameters
- How to fetch data in server components

### Server-Side Rendering (SSR)

**Why SSR:**
- Chosen for simplicity (no build step complexity)
- Want to see rendering steps for learning
- Content always fresh (fetches on each request)
- Acceptable performance for low-traffic site

**What I'll learn:**
- How to make pages async
- How to fetch data in server components
- How error handling works in SSR
- Performance characteristics

### Implementation Steps (To Do)

- [ ] Initialize Next.js project with App Router
- [ ] Set up TypeScript with strict mode
- [ ] Create adapter layer for Contentful
- [ ] Build home page (list view)
- [ ] Build detail page (dynamic route)
- [ ] Handle 404s for missing content
- [ ] Render rich text content

## Questions / Unresolved

- How does Next.js handle errors in server components?
- What's the difference between `notFound()` and throwing errors?
- How do I test Next.js server components?

## Resources

- Next.js Docs: https://nextjs.org/docs
- App Router Guide: https://nextjs.org/docs/app
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components

