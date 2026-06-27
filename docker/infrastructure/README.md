# LostInVirtual Infrastructure

Infrastructure as Code untuk semua core services.

## Architecture

```
Internet → Cloudflare DNS → Tunnel → NPM (auth_net) → Services
                                      ├── keycloak.lostinvirtual.world → Keycloak:8080
                                      ├── npm.lostinvirtual.world      → NPM:81
                                      ├── portainer.lostinvirtual.world→ Portainer:9000
                                      └── code.lostinvirtual.com       → CodeServer:8443
```

## Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| keycloak-db | postgres:16 | 5432 | Keycloak database |
| keycloak | keycloak:26.0.0 | 8081 | Identity & Access Management |
| nginx-proxy-manager | jc21/npm:latest | 80/81/443 | Reverse proxy & SSL |
| portainer | portainer-ce:latest | 9000/9443 | Docker management UI |
| cloudflare | cloudflared:latest | - | Secure tunnel to Cloudflare |

## Quick Start

```bash
cd docker/infrastructure

# 1. Copy and edit environment file
cp .env.example .env
nano .env

# 2. Create required network & volumes (first time only)
docker network create auth_net
docker volume create keycloak_db_data
docker volume create npm_data
docker volume create letsencrypt
docker volume create portainer_data

# 3. Start all services
docker compose up -d

# 4. Check status
docker compose ps
```

## First Login

### Nginx Proxy Manager
- URL: http://localhost:81
- Email: admin@example.com
- Password: changeme
- ⚠️ Will prompt to change password on first login

### Keycloak
- URL: https://keycloak.lostinvirtual.world/admin
- User: admin
- Password: (from KC_ADMIN_PASSWORD in .env)

### Portainer
- URL: http://localhost:9000
- Set admin password on first access

## Network

All services run on `auth_net` bridge network, except Cloudflare tunnel which uses host networking.

## Backups

```bash
# Keycloak DB
docker exec keycloak-db pg_dump -U keycloak keycloak > backup_$(date +%Y%m%d).sql

# NPM data
docker run --rm -v npm_data:/data -v $(pwd):/backup alpine tar czf /backup/npm_$(date +%Y%m%d).tar.gz /data
```

## Troubleshooting

```bash
# Check logs
docker compose logs -f keycloak
docker compose logs -f nginx-proxy-manager

# Restart Keycloak
docker compose restart keycloak

# Rebuild from scratch
docker compose down -v
docker compose up -d
```
