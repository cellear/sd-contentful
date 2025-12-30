# Learning Spec Kitty

This document tracks my journey learning Spec Kitty as I use it for the Simplify Drupal → Contentful migration project.

## What is Spec Kitty?

Spec Kitty is a spec-driven development workflow tool that helps coordinate multi-agent AI coding workflows. It provides:
- Real-time Kanban tracking
- Structured planning (spec → plan → tasks → implement)
- Worktree-based feature branch management
- Constitution-based project governance

## My Learning Journey

### Initial Setup (2025-12-27)

**What I learned:**
- Spec Kitty is installed via pip: `pip install spec-kitty-cli`
- Initialized with: `spec-kitty init . --ai=cursor,claude,codex --here --force`
- Creates structure: `.kittify/`, `.worktrees/`, agent command directories (`.cursor/`, `.claude/`, `.codex/`)
- Dashboard runs automatically on port 9237

**Key concepts:**
- **Worktrees**: Each feature gets its own git worktree (`.worktrees/001-feature-name/`)
- **Constitution**: Project-wide principles at `.kittify/memory/constitution.md`
- **Slash commands**: Type `/spec-kitty.constitution` etc. directly in Cursor chat
- **Planning workflow**: specify → clarify → plan → tasks → implement

**Gotchas:**
- Constitution file needs to exist in working directory (not just git) for dashboard to detect it
- Worktree structure can feel "hidden" but documents are accessible via symlinks or copies

### Creating the Constitution

**Process:**
- Ran `/spec-kitty.constitution`
- AI asked about project principles
- Created principles based on incoming prompt and my preferences
- Constitution lives at `.kittify/memory/constitution.md` (project-wide, not feature-specific)

**Key principles established:**
- Decoupled architecture (adapter pattern)
- Simplicity over abstraction (primary goal)
- Component-driven development
- Type safety (TypeScript strict)
- Content authoring standards (WYSIWYG, not Markdown)

### Creating the Feature Spec

**Process:**
- Ran `/spec-kitty.specify` with reference to `00-incoming-prompt.md`
- AI conducted discovery interview (asked about migration strategy)
- Generated spec with user stories, requirements, success criteria
- Created feature worktree automatically

**What I learned:**
- Specs focus on WHAT and WHY, not HOW (no implementation details)
- User stories must be independently testable
- Success criteria must be measurable and technology-agnostic
- Specs are written for business stakeholders, not developers

### Planning Phase

**Process:**
- Ran `/spec-kitty.plan`
- AI asked about rendering strategy (SSR vs SSG vs ISR)
- Generated `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/`
- All technical decisions documented with rationale

**What I learned:**
- Planning happens in phases: research → design → contracts
- Research document captures all technical decisions and alternatives considered
- Data model defines entities before implementation
- Quickstart provides setup instructions

### Task Breakdown

**Process:**
- Ran `/spec-kitty.tasks`
- Generated `tasks.md` with work packages (WP01-WP04)
- Created detailed prompt files for each work package in `tasks/`
- Each prompt includes subtasks, implementation guidance, test strategy

**What I learned:**
- Work packages group related subtasks
- Each package should be independently deliverable
- Prompts are exhaustive enough for a new agent to complete the work
- Tasks use flat structure (no subdirectories) - lanes determined by frontmatter

### Dashboard (WP01)

**What I learned:**
- Dashboard shows real-time Kanban board at http://127.0.0.1:9237
- Tracks work packages across lanes: planned → doing → for_review → done
- Shows workflow status (specify, plan, tasks, implement)
- Constitution detection issue: file must exist in working directory, not just git
- **WP01**: First accessed dashboard to track project setup progress
- **WP01**: Discovered Kanban lane updates require manual frontmatter editing (see Issues section)

## Tips & Tricks

- Documents are in `.worktrees/` - can create symlinks or copies to `docs/` for easier access
- Constitution is project-wide, not feature-specific
- Slash commands work directly in Cursor chat (no separate interface)
- Dashboard auto-updates as you work
- **Kanban board is read-only**: The dashboard displays status from frontmatter in work package files. To change lanes, edit the frontmatter manually (see Issues section for workaround) or use tooling. The board is a visualization, not an interactive editor.

## Issues & Workarounds

### Kanban Lane Updates (2025-12-29)

**Problem**: After completing WP01, the Kanban board still showed it in "planned" lane. Attempted to update using Spec Kitty tooling:

1. **`spec-kitty tasks update`** - Command not found (no such command)
2. **`.kittify/scripts/bash/tasks-move-to-lane.sh`** - Script exists but calls wrong command structure
3. **`python3 .kittify/scripts/tasks/tasks_cli.py update`** - Script exists but couldn't find feature directory:
   - Error: `Feature '001-contentful-migration' has no tasks directory at /Users/.../SD-CONTENTFUL/kitty-specs/001-contentful-migration/tasks`
   - It was looking in main repo, but feature is in `.worktrees/001-contentful-migration/kitty-specs/...`

**Workaround**: Manually edited the work package prompt file frontmatter:
- Changed `lane: "planned"` → `lane: "done"`
- Added agent and history entry
- Updated Activity Log section

**Root Cause**: The `tasks_cli.py` script appears to look for features in the main repo structure (`kitty-specs/`), but with worktrees, features are in `.worktrees/{feature}/kitty-specs/`. The script needs to detect worktree context or accept a path parameter.

**Feedback for Spec Kitty**: 
- Lane updates should work seamlessly from worktree directories
- Either detect worktree context automatically, or provide a `--worktree` flag
- Consider adding a `/spec-kitty.kanban` slash command for Cursor that handles this
- The dashboard reads frontmatter correctly, so the data model is fine - just the update tooling needs worktree awareness

**Status**: Manual workaround works fine, but tooling should handle this automatically.

### Kanban Board Interaction (2025-12-29)

**Observation**: The Kanban board in the dashboard is read-only - you cannot drag work packages between lanes.

**Current Behavior**: 
- Board displays status from frontmatter in work package prompt files
- To move a work package, you must edit the frontmatter `lane:` field
- Board refreshes to show updated status after file changes

**Rationale**: The board is a visualization of the source of truth (the files), not a separate UI state. This ensures consistency and prevents UI state from diverging from file state.

**Feature Request for Spec Kitty**:
- Add drag-and-drop functionality to the Kanban board
- When dragging a work package to a new lane, automatically update the frontmatter
- This would make the workflow more intuitive while maintaining file-based source of truth
- Could use the existing `tasks_cli.py update` command under the hood

**Workaround**: Manually edit the `lane:` field in the work package prompt file frontmatter (same as lane update issue above).

## Questions / Unresolved

- [Add questions as they come up]

## Resources

- GitHub: https://github.com/Priivacy-ai/spec-kitty
- Documentation: https://priivacy-ai.github.io/spec-kitty/

