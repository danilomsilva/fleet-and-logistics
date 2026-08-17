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

The implementation plan in `2-product-implementation-plan.md` (see "Detailed substeps") defines the ordered list of steps to execute against this rule.
