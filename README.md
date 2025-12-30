# Simplify Drupal → Contentful Migration

**SD-CONTENTFUL** - Modernizing Simplify Drupal by migrating from Drupal+React to Contentful+Next.js with a decoupled architecture, in order to explore and prototype non-Drupal architectures.

## Project Status

✅ **MVP Complete** - The migration is functionally complete and deployed! All 31 tips are accessible with images, styling, and full functionality.

**Live Demo**: https://sd-contentful.vercel.app/

This project uses [Spec Kitty](https://github.com/Priivacy-ai/spec-kitty) for spec-driven development.

## Overview

**Simplify Drupal** is a content site that provides tips and guidance. This project modernizes the platform by migrating from a Drupal backend with React frontend to a Next.js application powered by Contentful CMS. The architecture uses an adapter pattern to keep the UI decoupled from the CMS, enabling future backend changes without frontend rewrites.

## Architecture

- **Frontend**: Next.js (App Router) with Server-Side Rendering (SSR)
- **CMS**: Contentful
- **Language**: TypeScript (strict mode)
- **Pattern**: Adapter layer abstracts CMS access

## Project Structure

- `.worktrees/` - Feature worktrees (Spec Kitty workflow)
- `docs/` - Planning documents (copies for easy access)
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

The app is deployed to Vercel and automatically updates on push to the main branch. See `.worktrees/004-description-deploy-next/kitty-specs/004-description-deploy-next/quickstart.md` for deployment details.

**Custom Domain** (optional):
- Vercel's free tier supports custom domains if you want to use `contentful.simplifydrupal.com` instead
- Current domain `sd-contentful.vercel.app` is already clean and readable

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

