# Feature Specification: Contentful Migration

**Feature Branch**: `001-contentful-migration`  
**Created**: 2025-12-27  
**Status**: Draft  
**Input**: User description: "Migrate SimplifyDrupal from Drupal+React to Contentful+Next.js with decoupled architecture"

## Clarifications

### Session 2025-12-27

- Q: When Contentful API is unavailable or rate-limited, what should readers see? → A: Show a simple error message (e.g., "Contentful is down!") - simplicity prioritized over caching complexity for this low-traffic site

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Tips List (Priority: P1)

A reader visits the home page and sees a list of all available tips, ordered by tip number. This provides an overview of all content and allows readers to discover and navigate to specific tips.

**Why this priority**: The list view is the primary entry point for readers. Without it, users cannot discover available content. This is the foundation for all other functionality.

**Independent Test**: Can be fully tested by visiting the home page and verifying that all 31 tips are displayed in order, with each tip showing its title and being clickable to navigate to the detail page. This delivers immediate value by enabling content discovery.

**Acceptance Scenarios**:

1. **Given** the system has 31 tips in Contentful, **When** a reader visits the home page (`/`), **Then** all 31 tips are displayed in ascending order by tip number
2. **Given** the tips list is displayed, **When** a reader clicks on a tip title, **Then** they are navigated to that tip's detail page using the tip's slug
3. **Given** the system has no tips, **When** a reader visits the home page, **Then** an empty state is shown (no errors occur)

---

### User Story 2 - View Tip Detail (Priority: P2)

A reader navigates to a specific tip's detail page using its slug-based URL and sees the full tip content including title and rich text body.

**Why this priority**: The detail view is essential for reading individual tips. While the list enables discovery, the detail page delivers the actual content value to readers.

**Independent Test**: Can be fully tested by navigating to a tip's slug URL (e.g., `/03-site-builder`) and verifying that the tip's title and full rich text body are displayed correctly. This delivers value by enabling readers to consume the actual content.

**Acceptance Scenarios**:

1. **Given** a tip exists with slug "03-site-builder", **When** a reader visits `/03-site-builder`, **Then** the tip's title and rich text body are displayed
2. **Given** a tip's rich text body contains formatted content (headings, lists, links), **When** a reader views the detail page, **Then** all formatting is preserved and rendered correctly
3. **Given** a reader visits a slug that does not exist, **Then** a 404 error page is shown
4. **Given** a tip exists in Contentful, **When** a reader visits its slug URL, **Then** the URL remains stable and does not change

---

### Edge Cases

- What happens when Contentful API is unavailable or rate-limited? (System should display a simple, user-friendly error message such as "Contentful is down!" - no caching complexity required)
- How does system handle tips with missing required fields? (Should not display broken/incomplete tips)
- What happens when a tip's slug conflicts with a system route? (Slugs must be validated to avoid conflicts)
- How does system handle very long tip titles or body content? (Should render without breaking layout)
- What happens when tipNumber values are not sequential? (System should still order correctly by numeric value)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all tips on the home page (`/`) ordered by tip number in ascending order
- **FR-002**: System MUST display individual tip detail pages at `/[slug]` where slug matches the tip's slug field
- **FR-003**: System MUST render rich text content from Contentful with all formatting preserved (headings, lists, links, etc.)
- **FR-004**: System MUST implement a content adapter layer that abstracts CMS access (no direct Contentful API calls from UI components)
- **FR-005**: Adapter layer MUST expose exactly two functions: `getAllTips()` and `getTipBySlug(slug)`
- **FR-006**: System MUST maintain stable, slug-based URLs that do not change over time
- **FR-007**: System MUST handle missing or invalid tips gracefully (404 for non-existent slugs, no crashes for malformed data)
- **FR-008**: System MUST handle Contentful API unavailability by displaying a simple, user-friendly error message (e.g., "Contentful is down!") without complex caching logic
- **FR-009**: Content MUST be editable in Contentful via WYSIWYG interface without requiring code changes
- **FR-010**: System MUST support local development workflow with `next dev` command
- **FR-011**: UI components MUST be cleanly componentized and optimized for visual editing tools

### Key Entities *(include if feature involves data)*

- **Tip**: Represents a single piece of content. Key attributes: title (text), slug (unique identifier for URLs), tipNumber (integer for ordering), body (rich text content). All tips are independent entities with no relationships to other tips.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 31 tips from the existing Drupal system are successfully migrated and accessible in the new system
- **SC-002**: Readers can view the complete list of tips on the home page within 2 seconds of page load
- **SC-003**: Readers can view any individual tip detail page within 2 seconds of navigation
- **SC-004**: Content editors can edit tip content in Contentful's WYSIWYG interface and see changes reflected in the Next.js app without code deployment
- **SC-005**: The adapter layer successfully isolates CMS implementation, allowing the frontend to work with mock data during development
- **SC-006**: All tip URLs remain stable and accessible using the same slug-based pattern as the original system
- **SC-007**: The system renders rich text content correctly with 100% formatting preservation (headings, lists, links display as intended)

## Assumptions

- Content will be bulk-imported from Drupal to Contentful via CSV import (not manual entry)
- The existing 31 tips represent the complete content set (no new content types needed)
- Contentful free tier provides sufficient API rate limits for this use case
- Local development does not require Contentful API access (adapter can use fixtures/mocks)
- No authentication or user management is required (public read-only access)
- No search functionality is required (list and detail views only)
- No pagination needed (31 items fit on a single list page)

## Dependencies

- Contentful account and space setup
- Content model creation in Contentful (Tip content type with required fields)
- Data migration from Drupal to Contentful (CSV import process)
- Next.js project initialization
- Contentful Rich Text renderer for Next.js package

## Out of Scope

- User authentication or authorization
- Search functionality
- Comments or user interactions
- Content versioning or draft/publish workflow (handled by Contentful)
- Analytics or tracking
- SEO optimization beyond basic meta tags
- Performance optimization beyond initial load times
- Mobile-specific optimizations (responsive design assumed standard)
