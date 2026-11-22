---
name: kubernetes-helm-orchestration
description: Pod disruption budgets, horizontal pod autoscaling (HPA), readiness/liveness probes, and Helm chart templates.
---

# Kubernetes & Helm Deployment Best Practices

## Production Checklist
1. **Resource Limits & Requests**: Always specify CPU and Memory requests and limits to enable predictable scheduling.
2. **Probes**:
   - `livenessProbe`: Restart container if frozen.
   - `readinessProbe`: Remove from ingress load balancer until warm.
3. **Pod Disruption Budget (PDB)**: Ensure at least 80% replicas remain available during node upgrades.

