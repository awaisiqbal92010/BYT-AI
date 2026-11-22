---
name: state-machine-xstate
description: Finite state machines, statecharts, hierarchical states, guard conditions, and deterministic transition logs.
---

# State Machines & Deterministic Workflows (XState)

## Rules
- **Make Impossible States Impossible**: Replace multiple boolean flags (`isLoading`, `hasError`, `isSuccess`) with explicit states: `idle | loading | success | error`.
- **Pure Guard Conditions**: Evaluate transition conditions without side-effects.
- **Actor Model**: Decompose complex multi-step wizards into discrete communicating state machines.

