# LostInVirtual | Citizen Registry
Sistem registrasi warga digital yang modular, aman, dan terukur.

## Struktur Branching
- `main`: Production (Deploy ke VPS Production)
- `staging`: Uji coba (Deploy ke VPS Staging)
- `dev`: Pengembangan fitur baru

## Deployment Workflow
Setiap push ke branch `staging` atau `main` akan memicu GitHub Actions untuk otomatis deploy ke VPS.

## Status Deployment
| Branch | VPS IP | Port |
| :--- | :--- | :--- |
| `main` | 43.133.55.157 | 3001 |
| `staging` | 43.133.55.157 | 3002 |
| `dev` | 43.133.55.157 | 3003 |
