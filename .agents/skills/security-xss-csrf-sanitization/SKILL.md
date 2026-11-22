---
name: security-xss-csrf-sanitization
description: Web application security best practices, XSS prevention, Content Security Policy (CSP), and secure environment variable handling.
---

# Security, XSS & CSRF Sanitization Skill

Use this skill when auditing web applications for vulnerabilities, sanitizing inputs, and enforcing security policies.

## Security Practices

1. **Preventing Cross-Site Scripting (XSS)**
   - Never inject raw user strings into `dangerouslySetInnerHTML`.
   - Ensure iframe previews use strict `sandbox` attribute flags (`sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`).

2. **Environment Variable Hygiene**
   - Never expose server secrets (e.g. `E2B_API_KEY`, `OPENROUTER_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) to client-side bundles.
   - Prefix only public configuration with `NEXT_PUBLIC_`.
