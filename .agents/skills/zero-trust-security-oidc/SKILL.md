---
name: zero-trust-security-oidc
description: Mutual TLS, short-lived JWT credentials, PKCE auth flows, least-privilege IAM, and token binding.
---

# Zero-Trust Security & OpenID Connect (OIDC)

## Core Guardrails
1. **Never Trust, Always Verify**: Validate identity, device posture, and scope on every single request.
2. **PKCE Flow**: Mandatory Proof Key for Code Exchange on all public and single-page applications.
3. **Short-Lived Access Tokens**: 15-minute access token lifespan backed by secure rotating refresh tokens.
4. **No Secrets in Client Code**: All OAuth client secrets must reside strictly in server environments.

