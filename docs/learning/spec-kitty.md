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

### Dashboard

**What I learned:**
- Dashboard shows real-time Kanban board at http://127.0.0.1:9237
- Tracks work packages across lanes: planned → doing → for_review → done
- Shows workflow status (specify, plan, tasks, implement)
- Constitution detection issue: file must exist in working directory, not just git

## Tips & Tricks

- Documents are in `.worktrees/` - can create symlinks or copies to `docs/` for easier access
- Constitution is project-wide, not feature-specific
- Slash commands work directly in Cursor chat (no separate interface)
- Dashboard auto-updates as you work

## Questions / Unresolved

- [Add questions as they come up]

## Resources

- GitHub: https://github.com/Priivacy-ai/spec-kitty
- Documentation: https://priivacy-ai.github.io/spec-kitty/

