# fsdk-ts — Backlog

## FSDK-DISTRIBUTION — publish fsdk-ts as a versioned npm package (owner, 2026-10-15; research done, NOT scheduled)

This is the fsdk-ts half of **FSDK-DISTRIBUTION**. The full research, the decision and the work packages are in `foundation-sdk/BACKLOG.md`. In short: friends' apps install foundation-sdk and fsdk-ts as **pinned packages**, not as source, so they can't drift. This is a library, not a hosted API.

fsdk-ts specifics:
- Consumers use `file:` links and `npm install --install-links` today. Instead, publish the built `dist/` to npm or GitHub Packages, with a semver policy and a CHANGELOG.
- Define the public exports (hooks, clients, utils) and treat anything else as internal.
- Version fsdk-ts against the foundation-sdk API it targets. Document a compatibility table, or release both together.
- Plan with `/fsdk-ts-plan`. Prompt: `~/GitHub/Projects/prompts/fsdk-distribution-planner.md`.
