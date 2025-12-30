# Spec Kitty Feedback

This document collects feedback, bug reports, and feature requests for the Spec Kitty project (author: Robert Douglas).

**Purpose**: Centralized list of items to report to the Spec Kitty team, with brief summaries and references to detailed information elsewhere in the repository.

---

## Bugs

### 1. `setup-plan.sh` Script Fails with AttributeError

**Summary**: The `/spec-kitty.plan` command consistently fails when running `setup-plan.sh`, requiring manual creation of plan files.

**Error**:
```
AttributeError: 'Mission' object has no attribute 'commands_dir'
mkdir: : No such file or directory
```

**Impact**: Plan files (`plan.md`, `research.md`, `quickstart.md`) must be created manually using existing templates as reference.

**Workaround**: Manually create plan files based on template patterns from other features.

**Details**: See implementation notes in `.worktrees/004-description-deploy-next/kitty-specs/004-description-deploy-next/plan.md` (created manually after script failure).

**Date Reported**: 2025-12-30

---

### 2. `tasks_cli.py` Doesn't Work from Worktree Directories

**Summary**: The `tasks_cli.py` script fails to find feature directories when run from worktree directories because it looks in the main repo structure instead of the worktree.

**Error**:
```
Feature '001-contentful-migration' has no tasks directory at /Users/.../SD-CONTENTFUL/kitty-specs/001-contentful-migration/tasks
```

**Root Cause**: Script looks for features in main repo (`kitty-specs/`), but with worktrees, features are in `.worktrees/{feature}/kitty-specs/`.

**Impact**: Cannot use `tasks_cli.py update` command to move work packages between Kanban lanes from worktree directories.

**Workaround**: Manually edit the `lane:` field in work package frontmatter files.

**Details**: See `docs/learning/spec-kitty.md` section "Kanban Lane Updates" for full context and workaround.

**Date Reported**: 2025-12-29

---

## Feature Requests

### 1. Kanban Board Drag-and-Drop Functionality

**Summary**: Add drag-and-drop functionality to the Spec Kitty dashboard Kanban board for moving work packages between lanes.

**Current State**: Work packages must be moved by manually editing the `lane:` field in work package frontmatter.

**Desired State**: Drag-and-drop interface in the dashboard to move work packages between "planned", "doing", "for_review", and "done" lanes.

**Impact**: Would significantly improve workflow ergonomics and reduce manual file editing.

**Details**: See `docs/learning/spec-kitty.md` section "WP02: Kanban Lane Updates" for current workaround and feature request.

**Date Requested**: 2025-12-29

---

## Notes

- All feedback items are based on actual usage during the SD-CONTENTFUL project migration
- Workarounds are documented in `docs/learning/spec-kitty.md` where applicable
- This document is maintained as issues are discovered or features are requested

