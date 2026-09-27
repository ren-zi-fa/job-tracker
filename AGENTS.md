# Agent Rules

<!-- BEGIN:agent-rules -->
## Skill Loading

Skills are loaded on-demand.

Do not read or load all `SKILL.md` files at the beginning of a task.

Before loading a skill:

1. Determine whether the skill is directly relevant to the current Next.js task.
2. Load only the skill(s) required to complete the task.
3. Do not load unrelated skills.
4. Do not load the same skill more than once unless its content is needed again.
5. If the task can be completed without a skill, do not load a skill.

### Examples

For a Next.js UI task:

* Load `nextjs` when Next.js-specific conventions are required.
* Load `ui-from-screenshot` only when implementing a UI from a screenshot.
* Load `frontend` only if general frontend guidelines are needed.
* Do not load unrelated skills.

For a Next.js API task:

* Load `nextjs` when working with Route Handlers, Server Actions, or Next.js API functionality.
* Load `database` only when the task involves database operations.
* Do not load UI-related skills unless the task requires frontend changes.

For a Next.js debugging task:

* Load only the skill directly related to the problem.
* Do not load every available skill to investigate the issue.

## Context Efficiency

Keep the context focused.

Do not inspect or read the full contents of unrelated skills.

Only load a skill when its instructions are relevant to the current task.

Prefer the minimum number of skills necessary to complete the task.

If the task can be completed without loading a skill, do not load one.

## Skill Priority

When multiple skills are available, use this priority:

1. Task-specific skill
2. Next.js-specific skill
3. General frontend skill

For example:

`ui-from-screenshot` > `nextjs` > `frontend`

If a task-specific skill already contains the required instructions, do not load additional skills unnecessarily.

## Do Not Duplicate Instructions

Do not copy the entire contents of a loaded `SKILL.md` into the response or another context file.

Use the skill instructions while performing the task.

Do not repeat skill instructions unless explicitly requested.

<!-- END:agent-rules -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
