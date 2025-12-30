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

### WP04: User Story 2 - View Tip Detail (2025-12-29)

**What I learned:**

#### Dynamic Routes with Async Params

In Next.js 16+, `params` in dynamic routes is a **Promise** and must be awaited:

```typescript
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TipDetailPage({ params }: PageProps) {
  const { slug } = await params; // Must await!
  const tip = await getTipBySlug(slug);
  // ...
}
```

**Why**: This allows Next.js to optimize route generation. Always await `params` before using it.

#### Image Rendering in Server Components

Images can be rendered directly in Server Components using standard `<img>` tags:

```typescript
{tip.imageUrl && (
  <img
    src={tip.imageUrl}
    alt={tip.title}
    style={{ maxWidth: "100%", height: "auto" }}
  />
)}
```

**Key points:**
- No special Next.js Image component needed for basic use cases
- Images from Contentful CDN are already optimized
- Use standard HTML `<img>` with proper `alt` text for accessibility

#### Rich Text Rendering

Contentful's rich text is rendered using `@contentful/rich-text-react-renderer`:

```typescript
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

{documentToReactComponents(tip.body, options)}
```

**Custom rendering options** allow you to style specific block types (headings, lists, paragraphs, etc.).

### WP03: User Story 1 - View Tips List (2025-12-29)

**What I learned:**

#### Server vs Client Components

**Critical distinction**: Components are Server Components by default in Next.js App Router. To use interactivity (event handlers, hooks, browser APIs), you must add `"use client"` directive at the top of the file.

**The error we hit**: 
```
Error: Event handlers cannot be passed to Client Component props.
```

**The fix**: Added `"use client"` to `TipList.tsx` because it uses `onMouseEnter` and `onMouseLeave` for hover effects.

**Rule of thumb**: 
- Server Components: Data fetching, no interactivity, smaller bundle
- Client Components: Interactivity, hooks, browser APIs, larger bundle (JavaScript sent to client)

**Best practice**: Keep most components as Server Components, only mark Client Components when you need interactivity.

#### Component Composition Pattern

- Server Component (home page) fetches data
- Server Component passes data to Client Component (TipList)
- Client Component handles interactivity (hover effects, links)
- This is the recommended Next.js pattern: fetch in Server, interact in Client

#### Next.js Link Component

- `Link` from `next/link` provides client-side navigation (faster than full page reloads)
- Works in both Server and Client Components
- Use `href` prop for the route (e.g., `href={`/${tip.slug}`}`)
- Automatically prefetches linked pages for better performance

#### Integration Testing

- Can test Server Components by awaiting them (they're async functions)
- Mock adapter functions to avoid real API calls
- Use React Testing Library to verify rendered output
- Test user interactions (clicking links) even in integration tests

### WP05: CSS Modules & Grid Layout (2025-12-30)

**What I learned implementing the grid layout:**

#### CSS Modules in Next.js
- **Automatic scoping**: Next.js automatically scopes CSS Module class names to prevent conflicts
- **Import syntax**: `import styles from './Component.module.css'`
- **Usage**: `className={styles.className}` - class names are transformed to unique identifiers
- **No global conflicts**: CSS Modules prevent style leakage between components

#### Grid Layout Implementation
- **CSS Grid**: Used `display: grid` with `grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))` for responsive grid
- **Auto-fill**: Automatically creates as many columns as fit in the container
- **Minmax**: Each column is at least 250px wide, can grow to fill available space
- **Gap**: `gap: 1.5rem` provides consistent spacing between grid items

#### Legacy App Structure Discovery
- **Original structure**: Grid of cards, not a simple list
- **Card components**: Each tip is a card with image, number, title, and "read more" link
- **Image thumbnails**: Cards display thumbnail images (250px width)
- **Hover effects**: Cards have transform and shadow effects on hover

#### Component Structure
```tsx
<div className={styles.tipsGrid}>
  {tips.map(tip => (
    <Link className={styles.tipCard}>
      <img className={styles.tipThumb} />
      <h3>Tip {tip.tipNumber}</h3>
      <p>{tip.title}</p>
      <span className={styles.readMore}>Click to read more...</span>
    </Link>
  ))}
</div>
```

#### Square Thumbnail Implementation (2025-12-30)
- **CSS for square thumbnails**: Set `height: 250px` (fixed) and `object-fit: cover` to ensure square display
- **Image transformation**: Contentful URL parameters (`?w=250&h=250&fit=fill`) handle the cropping server-side
- **Combined approach**: Contentful CDN crops the image, CSS ensures square container
- **Result**: Perfect square thumbnails matching original Drupal site's image style

**Key Insight**: Understanding the original app structure (from HTML source) was crucial for implementing the correct layout. CSS Modules make it easy to scope styles per component, preventing conflicts with Next.js defaults. For square thumbnails, combine Contentful image transformations with fixed-height CSS containers.

### WP06: Vercel Deployment (2025-12-30)

**What I learned deploying to Vercel:**

#### Framework Detection
- **Vercel auto-detection**: Vercel should auto-detect Next.js, but sometimes you need to manually set **Framework Preset** to "Next.js" in project settings
- **Output Directory**: Must be **empty** for Next.js (not "public" or any other value)
- **Build Command**: Auto-detects as `next build` (verify this is set)
- **Root Directory**: Empty when app is at repo root (no worktree path needed)

#### Build-Time vs Runtime Environment Variables
- **Problem**: Next.js tries to analyze code during build, which can fail if Contentful client initializes without env vars
- **Solution**: Lazy initialization using Proxy pattern - client is only created when actually used
- **Result**: Build succeeds without env vars, runtime throws clear errors if vars are missing

#### Lazy Client Initialization
```typescript
// Client is created on-demand, not at module load time
let _contentfulClient: ContentfulClientApi<any> | null = null;

function getContentfulClient(): ContentfulClientApi<any> {
  if (_contentfulClient) return _contentfulClient;
  // Create client only when needed (at runtime, not build time)
  _contentfulClient = createClient({ space, accessToken });
  return _contentfulClient;
}

export const contentfulClient = new Proxy({} as ContentfulClientApi<any>, {
  get(_target, prop) {
    const client = getContentfulClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
```

#### Project Structure for Deployment
- **Canonical location**: Next.js app should be at repo root for standard deployment
- **Worktrees**: Spec Kitty worktrees are for development, but production code lives at root
- **Build artifacts**: `.next/`, `out/`, `*.tsbuildinfo` should be in `.gitignore`

**Key Insight**: Vercel deployment requires proper framework detection. Lazy initialization allows builds to succeed without runtime env vars, which are provided by Vercel at deployment time.

### Implementation Steps

- [x] Initialize Next.js project with App Router (WP01)
- [x] Set up TypeScript with strict mode (WP01)
- [x] Create adapter layer for Contentful (WP02)
- [x] Build home page (list view) (WP03)
- [x] Build detail page (dynamic route) (WP04)
- [x] Handle 404s for missing content (WP04)
- [x] Render rich text content (WP04)
- [x] Deploy to Vercel (WP06)

## Questions / Unresolved

- How does Next.js handle errors in server components?
- What's the difference between `notFound()` and throwing errors?
- How do I test Next.js server components?

## Resources

- Next.js Docs: https://nextjs.org/docs
- App Router Guide: https://nextjs.org/docs/app
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components

