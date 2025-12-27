# Simplify Drupal → Contentful Migration

**SD-CONTENTFUL** - Modernizing Simplify Drupal by migrating from Drupal+React to Contentful+Next.js with a decoupled architecture, in order to explore and prototype non-Drupal architectures.

## Project Status

🚧 **In Progress** - This is a work-in-progress migration project using [Spec Kitty](https://github.com/Priivacy-ai/spec-kitty) for spec-driven development.

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

See the planning documents in `docs/001-contentful-migration/` or `.worktrees/001-contentful-migration/kitty-specs/001-contentful-migration/` for:
- Feature specification
- Implementation plan
- Technical research
- Data model
- Quickstart guide
- Work packages

## License

[Add your license here]

