# Simplify Drupal → Contentful Demo

**SD-CONTENTFUL** - A technology demonstration exploring Contentful+Next.js as an alternative to Drupal. This is a **demo/experiment**, not intended to replace the current Simplify Drupal site.

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

**Simplify Drupal** is a content site that provides tips and guidance. This demo explores a Contentful+Next.js architecture as a technology experiment. The architecture uses an adapter pattern to keep the UI decoupled from the CMS, enabling future backend changes without frontend rewrites.

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

