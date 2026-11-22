---
name: component-testing-debugging
description: Diagnosing React compilation errors, unclosed JSX tags, missing imports, and self-healing build retry loops.
---

# Component Testing & Debugging Skill

Use this skill when diagnosing build errors, resolving missing imports, and performing automated code self-healing.

## Debugging Workflows

1. **Common JSX Error Signatures**
   - Unclosed tags, mismatched brackets, or missing Lucide icon imports.
   - Using non-standard HTML attributes instead of React camelCase equivalents.

2. **Self-Healing Build Loop**
   - Run compilation check in sandbox (`npm run build`).
   - Capture stderr and file trace.
   - Run AI Debugger sub-agent to patch the specific offending lines and re-verify.
