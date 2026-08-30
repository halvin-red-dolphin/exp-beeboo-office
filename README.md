# exp-beeboo-office

EXP-001 — BeeBoo Office (Sims-style agent visualisation). Test Rig experiment repo.

**Slice 1 (headless core logic):** office grid model, A* pathfinding, worker state
machine, event bus. No rendering — everything unit-testable.

- Proposal & rules: Obsidian vault `journal/Experiments/EXP-001 BeeBoo Office/`
- Orchestrator: [test-rig](https://github.com/halvin-red-dolphin/test-rig)
- Contract: container run executes the suite and writes `/results/results.json`
  (schema v1); exit 0 = green.

Tests are the spec (written by the reviewer). The builder model iterates on `src/`
only — test files are read-only for the builder.
