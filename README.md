# LostInVirtual | Citizen Registry

The digital frontier's premier citizen registry. A sovereign ecosystem for identity, status, and community.

## Architecture
- **Monorepo**: Next.js 16 (Web), shared packages, and Dockerized infrastructure.
- **Workflow**: Git-flow inspired (main, staging, develop, feature/*).
- **Deployment**: Automated CI/CD pipelines to VPS via Portainer/Docker.

## Branching Strategy
- `main`: Production-ready, stable releases.
- `staging`: Pre-release testing, QA.
- `develop`: Integration branch for active feature development.
- `feature/*`: Short-lived branches for individual tasks.

## Getting Started
1. Clone the repo.
2. Ensure environment variables are set (see `.env.example`).
3. Deploy via Docker: `bash docker/deploy.sh`
