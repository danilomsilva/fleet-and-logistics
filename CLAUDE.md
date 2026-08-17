# CLAUDE.md

## Development workflow — human pace, one step at a time

Build this project the way a human would: one atomic step at a time, never in large batched jumps.

For every substep:

1. **Do exactly one thing** — one install, one config change, one component, one test, one file. Not several bundled together.
2. **Verify it works** before moving on — run the relevant check (build, lint, typecheck, unit test, or dev server), and confirm it's clean.
3. **Once verified, commit locally.** Each commit should represent one working, verified increment.

**Push to GitHub only once, at the end of a full step** (e.g. all of step 1's substeps 1.1–1.15) — not after every substep. So a step accumulates one commit per substep locally, then a single push sends the whole batch.

Do not get ahead of this cadence, even when a task looks trivial or the next several substeps seem obvious. Don't combine unrelated changes into one commit. If a substep's verification fails, fix it before moving on or before committing — never commit or push a broken substep.

**At the end of a full step** (after its final substep is verified, committed, and pushed), run `/compact` to optimize the context window before starting the next step.

**Don't commit or push unless a substep or step has actually been finished.** Meta/config changes (e.g. editing this file) don't get their own commit — they ride along with the next substep/step that does get committed. If nothing has been completed yet, there is nothing to commit or push.

## Keeping the docs self-maintained

The `.md` files in this repo (`1-product-specification.md`, `2-product-implementation-plan.md`, `README.md`, `CLAUDE.md`) and the codebase are meant to stay in sync with each other and with reality.

If a request would do something different from what these files or the existing code describe — a different stack choice, a different build order, a different rule — **flag the conflict instead of just proceeding.** We decide together how to resolve it, and then every file where that information is documented gets updated to reflect the decision (not just the one file that happened to be open). Stale or contradictory docs are treated as bugs.

## Never assume

Never assume — always double check to confirm before starting work on anything. If something is unclear, ambiguous, or not explicitly covered by the docs/code/instructions, verify or ask rather than guessing.

The implementation plan in `2-product-implementation-plan.md` (see "Detailed substeps") defines the ordered list of steps to execute against this rule.
