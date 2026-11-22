---
name: react-state-management
description: Best practices for managing local, lifted, and global state in React applications using hooks and reducers.
---

# React State Management Skill

Use this skill when designing component state flows, form states, and client-side stores.

## Patterns

1. **Local vs Lifted State**
   - Keep state as local as possible. Only lift state to parent components when two or more siblings need to synchronize.
   - Use `useCallback` and `useMemo` for expensive computations and stable callbacks.

2. **Complex State Transitions**
   - Prefer `useReducer` for complex state logic involving multiple sub-values or dependent actions.
   - For optimistic UI updates: update local state immediately and roll back on error.

3. **Persistent State**
   - Sync critical user settings to `localStorage` safely with `typeof window !== "undefined"` checks.
