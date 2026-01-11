# Simplify Drupal → Contentful Demo

**SD-CONTENTFUL** - A technology demonstration exploring migration paths from traditional Drupal architecture to modern headless CMS (Contentful + Next.js). This project demonstrates Python-based content transformation, API design considerations, and CMS evolution patterns.

Part of broader research into CMS migration tooling and AI-assisted platform transitions.

## Project Status

✅ **MVP Complete** - Demo is functionally complete and deployed! All 31 tips are accessible with images, styling, and full functionality.

**Live Demos**:
- **Vercel**: https://sd-contentful.vercel.app/
- **Pantheon**: https://dev-sd-contentful.pantheonsite.io/

**Original Sites**:
- **Original Drupal site**: https://simplifydrupal.com/ (monolithic Drupal version)
- **React version**: https://simplifydrupal.com/react-app/ (Drupal backend + React frontend)

This project uses [Spec Kitty](https://github.com/Priivacy-ai/spec-kitty) for spec-driven development.

## Overview

This project explores the technical challenges and architectural decisions involved in migrating from traditional monolithic CMS (Drupal) to modern headless architectures. Key focus areas:

**Migration Strategy:**
- Python-based content transformation and data mapping
- CSV-based intermediate format for content portability
- Automated import scripts for bulk content migration
- Preservation of content relationships and metadata

**Technical Approach:**
- Adapter pattern to decouple UI from CMS backend
- API-first design enabling future backend flexibility
- TypeScript strict mode for type safety across migration boundaries
- Server-side rendering (SSR) for performance and SEO

**Real-World Constraints:**
- Managing content transformation across different data models
- Maintaining SEO and URL structure during migration
- Balancing modern architecture with practical migration paths
- Multi-platform deployment (Vercel, Pantheon) for hosting flexibility

## Architecture

- **Frontend**: Next.js (App Router) with Server-Side Rendering (SSR)
- **CMS**: Contentful
- **Language**: TypeScript (strict mode)
- **Pattern**: Adapter layer abstracts CMS access

## Project Structure

- `.worktrees/` - Feature worktrees (Spec Kitty workflow)
- `docs/` - Documentation, guides, and planning documents
- `scripts/` - Utility scripts for data migration and content import
- `scripts/data/` - CSV data files for content import
- `.kittify/` - Spec Kitty configuration and constitution

## Development

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.local.example` to `.env.local`
   - Add your Contentful Space ID and Access Token

3. **Run development server**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` to see the app locally.

### Deployment

The app is deployed to two platforms:

#### Vercel Deployment
- **Live**: https://sd-contentful.vercel.app/
- Automatically deploys on push to main branch
- See `.worktrees/004-description-deploy-next/kitty-specs/004-description-deploy-next/quickstart.md` for details

#### Pantheon Deployment
- **Live**: https://dev-sd-contentful.pantheonsite.io/
- Deployed to Pantheon's Next.js hosting platform
- **See [docs/PANTHEON_DEPLOYMENT.md](docs/PANTHEON_DEPLOYMENT.md)** for full setup guide
- Includes health check endpoint at `/api/health`

**Custom Domain** (optional):
- Both platforms support custom domains
- Current domains are clean and readable

### Planning Documents

See the planning documents in `docs/001-contentful-migration/` or `.worktrees/001-contentful-migration/kitty-specs/001-contentful-migration/` for:
- Feature specification
- Implementation plan
- Technical research
- Data model
- Quickstart guide
- Work packages

## License

MIT License - See LICENSE file for details

