# LostInVirtual | Citizen Registry

The digital frontier's premier citizen registry. Claim your identity, secure your status, and become part of the ecosystem.

## Vision
To build a sovereign, secure, and transparent registry system for the digital nomad and virtual citizen ecosystem. LostInVirtual is built to be the operating system for your virtual identity.

## Development Workflow
We follow an agile, modern industry standard for continuous delivery.

### Branching Strategy
- `main`: Production-ready, stable, deployed to VPS.
- `staging`: Pre-production, mirrors production for final QA.
- `dev`: Active development, integration of new features.

### Automated Deployment
- Push to `main` -> Auto-deploy to Production.
- Push to `staging` -> Auto-deploy to Staging environment.
- Push to `dev` -> Auto-deploy to Development environment.

## Infrastructure
- **Orchestration:** Docker Compose
- **Management:** Portainer
- **Proxy/Ingress:** Nginx Proxy Manager
- **Access:** Cloudflare Tunnel

---
*Built with spirit, secured by design.*
