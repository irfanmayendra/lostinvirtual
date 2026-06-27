# LostInVirtual — Digital Citizen Registry 🌍

Platform registrasi warga digital. Beli merchandise → aktivasi token → jadi citizen → terlihat di peta dunia.

## Live

| Environment | URL | Status |
| :--- | :--- | :--- |
| Dev | https://dev.lostinvirtual.world | ✅ Running |
| Keycloak | https://keycloak.lostinvirtual.world | ✅ Running |

## Fitur

- **Keycloak SSO** — Login single sign-on via Keycloak OIDC
- **Token Activation** — Aktivasi merchandise (baju/hoodie/jacket/cap) via token unik
- **Citizen Card** — ID card digital (LIV-XXXXX) untuk setiap citizen
- **World Map** — Peta interaktif global citizen berdasarkan IP geolocation
- **Achievement System** — Badge dan poin untuk milestone citizen
- **IP Geolocation** — Auto-detect lokasi dari IP address

## Tech Stack

- **Frontend:** Next.js 16 (Pages Router), Tailwind CSS v4
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL 16
- **Auth:** Keycloak 26 (OIDC), NextAuth.js v4
- **Infra:** Docker, Cloudflare Tunnel, Nginx Proxy Manager
- **CI/CD:** GitHub Actions → GHCR → Docker

## Struktur Branching

| Branch | Purpose |
| :--- | :--- |
| `main` | Production |
| `staging` | Uji coba |
| `dev` | Pengembangan fitur |

## Deployment

```bash
# Dev
docker build -f Dockerfile.dev -t lostinvirtual-web:debug .
docker run -d --name liv-web-dev --network auth_net --env-file .env.dev-container -p 3000:3000 lostinvirtual-web:debug

# Staging / Production
docker compose -f docker-compose.yml up -d
```

## Database Schema

| Table | Description |
| :--- | :--- |
| `users` | Keycloak bridge — local user profiles |
| `tokens` | Merchandise activation codes |
| `citizens` | Activated citizen profiles |
| `regions` | World map regions |
| `achievements` | Badge definitions |
| `citizen_achievements` | Citizen-achievement join table |

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
cd packages/database && npx prisma generate

# Run dev server
cd apps/web && npm run dev

# Database migration
cd packages/database && npx prisma migrate dev
```

## API Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/world-map` | Public | Get all regions + citizen counts |
| GET | `/api/citizen/me` | Required | Get current citizen profile |
| POST | `/api/activate` | Required | Activate merchandise token |
| POST | `/api/citizen/upgrade` | Required | Upgrade merchandise |

## Environment Variables

| Variable | Description |
| :--- | :--- |
| `KEYCLOAK_URL` | Keycloak server URL |
| `KEYCLOAK_REALM` | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | Keycloak client ID |
| `KEYCLOAK_CLIENT_SECRET` | Keycloak client secret |
| `KEYCLOAK_ISSUER` | Keycloak OIDC issuer URL |
| `NEXTAUTH_URL` | NextAuth callback URL |
| `NEXTAUTH_SECRET` | NextAuth encryption secret |
| `DATABASE_URL` | PostgreSQL connection string |

> ⚠️ **Jangan commit file `.env` atau `.env.dev-container` ke repository.**

## Struktur Project

```
lostinvirtual/
├── apps/web/              # Next.js web application
│   ├── components/        # React components
│   ├── lib/               # Auth, Prisma, Geo utilities
│   ├── pages/             # Pages Router (API + UI)
│   └── styles/            # Tailwind CSS
├── packages/database/     # Prisma schema + migrations
├── Dockerfile.dev         # Dev Docker build
├── docker-compose.dev.yml # Docker Compose config
└── .github/workflows/     # CI/CD pipelines
```

## License

Proprietary — Irfan Mayendra
