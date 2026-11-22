---
name: e2b-sandbox-orchestration
description: Best practices for provisioning, managing, and running Vite development servers and terminal commands inside E2B cloud microVMs.
---

# E2B Sandbox Orchestration Skill

Use this skill when managing cloud sandbox containers, provisioning isolated microVMs, and executing terminal commands.

## Orchestration Rules

1. **Filesystem Provisioning**
   - Place project files in `/home/user/app`.
   - Ensure parent directories are created with `mkdir -p` before writing files.

2. **Vite Server Configuration**
   - Always run Vite with `--host 0.0.0.0 --port 5173` and `allowedHosts: true` in `vite.config.js`.
   - Launch long-running dev servers with `background: true`.

3. **Lifecycle & Timeout Management**
   - Track active sandbox instances in memory with 5-minute idle timeouts.
   - Clean up microVM instances with `sandbox.kill()` to release cloud resources.
