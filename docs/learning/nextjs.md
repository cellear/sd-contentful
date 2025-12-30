# Learning Next.js

This document tracks my journey learning Next.js as I build the Simplify Drupal frontend.

## What is Next.js?

Next.js is a React framework that provides:
- Server-side rendering (SSR)
- Static site generation (SSG)
- App Router (file-based routing)
- Built-in optimizations

## My Learning Journey

**Work Packages**: WP01 (Project Setup), WP03 (List View), WP04 (Detail View)

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

### WP01: Project Setup (2025-12-29)

**What I learned setting up the Next.js project:**

#### Project Initialization

Unlike traditional web apps where you might create `index.html` and link CSS/JS files, Next.js uses a structured project setup:

1. **Package Management**: Next.js is installed via npm (like any Node.js project)
   - `npm init -y` creates `package.json`
   - `npm install next react react-dom typescript` installs core dependencies
   - This is similar to installing jQuery or Bootstrap, but for the entire framework

2. **TypeScript Configuration**: `tsconfig.json` is like a `.htaccess` or webpack config - it tells TypeScript how to compile
   - `"strict": true` enforces type safety (catches bugs at compile time)
   - `"jsx": "react-jsx"` tells TypeScript how to handle JSX (React's HTML-in-JS syntax)
   - Path aliases (`@/*`) let you import with `@/lib/types` instead of `../../lib/types`

3. **Project Structure**: Next.js uses conventions (like Rails or Django)
   - `app/` directory = your routes (like `public/` in traditional apps, but with special files)
   - `app/page.tsx` = home page (`/`) - this is like `index.html` but it's a React component
   - `app/layout.tsx` = wrapper for all pages (like a base template in Django/Twig)
   - `lib/` = utility code (like `includes/` or `helpers/` in traditional PHP)
   - `components/` = reusable UI pieces (like partials or includes)

#### Key Differences from Traditional Web Development

**File-based Routing**: 
- In traditional web: `about.html` → `/about.html`
- In Next.js: `app/about/page.tsx` → `/about` (automatic, no config needed)
- Dynamic routes: `app/[slug]/page.tsx` → `/anything` (like Apache mod_rewrite, but built-in)

**Server Components (Default)**:
- Traditional: HTML is static, JS runs in browser
- Next.js App Router: Components run on server by default (like PHP/ASP, but with React)
- This means you can fetch data directly in your component, no separate API call needed
- The HTML is generated server-side, then sent to browser (SSR)

**TypeScript Everywhere**:
- Like adding type hints to PHP or type annotations to Python
- Catches errors before runtime (like linting, but for types)
- IDE autocomplete works better because it knows what types things are

#### Development Server

Running `npm run dev` starts a development server (like `php -S localhost:8000` or Django's `runserver`):
- Watches for file changes (auto-reloads)
- Runs on `http://localhost:3000` by default
- Shows compilation errors in browser (helpful!)
- Uses Turbopack (Next.js's fast bundler, like webpack but faster)

#### What We Created in WP01

1. **Basic Next.js structure**: `app/`, `lib/`, `components/` directories
2. **Root layout** (`app/layout.tsx`): Wraps all pages, sets HTML metadata
3. **Home page placeholder** (`app/page.tsx`): Simple component that renders "Tips list will go here"
4. **TypeScript types** (`lib/types/tip.ts`): Defined our data structure (like a database schema, but for TypeScript)
5. **Environment config** (`.env.local.example`): Template for API keys (like `.env` in Laravel/Django)

**Key Insight**: Next.js feels like a hybrid between a traditional framework (conventions, structure) and a modern SPA (React components, client-side interactivity). The App Router makes it feel more like traditional server-side rendering, but with React's component model.

### WP02: Adapter Layer Integration (2025-12-29)

**What I learned:**
- Server components can call async functions directly (no useEffect needed)
- `getAllTips()` is called in the page component, not in a client component
- Error handling: try/catch in server component, display error in JSX
- Environment variables are automatically loaded from `.env.local` by Next.js
- Next.js auto-reloads when `.env.local` changes (no server restart needed for env vars)

**Key insight**: Server components make data fetching simple - just call the async function and use the result. No state management, no loading states (unless you want them), no client-side fetching complexity.

### Implementation Steps

- [x] Initialize Next.js project with App Router (WP01)
- [x] Set up TypeScript with strict mode (WP01)
- [x] Create adapter layer for Contentful (WP02)
- [ ] Build home page (list view) (WP03)
- [ ] Build detail page (dynamic route) (WP04)
- [ ] Handle 404s for missing content (WP04)
- [ ] Render rich text content (WP04)

## Questions / Unresolved

- How does Next.js handle errors in server components?
- What's the difference between `notFound()` and throwing errors?
- How do I test Next.js server components?

## Resources

- Next.js Docs: https://nextjs.org/docs
- App Router Guide: https://nextjs.org/docs/app
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components

