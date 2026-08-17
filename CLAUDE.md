# CLAUDE.md

## Development workflow — human pace, one step at a time

Build this project the way a human would: one atomic step at a time, never in large batched jumps.

For every step:

1. **Do exactly one thing** — one install, one config change, one component, one test, one file. Not several bundled together.
2. **Verify it works** before moving on — run the relevant check (build, lint, typecheck, unit test, or dev server), and confirm it's clean.
3. **Once verified, commit and push to GitHub** before starting the next step. Each commit should represent one working, verified increment.

Do not get ahead of this cadence, even when a task looks trivial or the next several steps seem obvious. Don't combine unrelated changes into one commit. If a step's verification fails, fix it before moving on or before committing — never push a broken step.

The implementation plan in `2-product-implementation-plan.md` (see "Detailed substeps") defines the ordered list of steps to execute against this rule.
