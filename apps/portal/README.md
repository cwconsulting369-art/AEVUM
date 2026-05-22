# AEVUM Customer Portal (app.aevum-system.de)

Self-Service-Portal für AEVUM-Customers — Login via Magic-Link, Profile/Permissions/Projects verwalten, API-Keys einreichen.

## Stack
- Vite + React 19 + TypeScript
- TailwindCSS 3
- React-Router 7
- react-hook-form + zod
- Sonner (Toast)

## Pages
| Route | Page | Auth |
|---|---|---|
| `/` | Login (Magic-Link Request) | public |
| `/auth/verify?token=...` | Token verifizieren + JWT-Store | public |
| `/dashboard` | Account-Overview + Onboarding-Checklist | required |
| `/profile` | Netzwerk-Profil (Industry, Vision, Visibility) | required |
| `/permissions` | Sharing-Permissions toggeln + signieren | required |
| `/projects` | Project-Liste + Neue anlegen | required |
| `/projects/:slug` | Project-Detail + API-Keys verwalten | required |

## Setup (local dev)
```bash
cd apps/portal
npm install
echo "VITE_AEVUM_API_BASE_URL=http://localhost:3210" > .env.local
npm run dev
# → http://localhost:5180
```

## Production
- Domain: `app.aevum-system.de`
- API-Base: `VITE_AEVUM_API_BASE_URL=https://api.aevum-system.de` (set in Vercel env)
- Vercel deployment as separate project from `apps/web/`

## API-Endpoints used
- `POST /api/auth/magic-link/request` — login link request
- `POST /api/auth/magic-link/verify` — token → JWT
- `POST /api/auth/refresh` — JWT refresh
- `GET /api/me` — own account + sub-resources
- `PATCH /api/me/profile` — update profile
- `PATCH /api/me/permissions` — toggle sharing
- `GET/POST/PATCH /api/me/projects[/:slug]` — projects CRUD
- `GET/POST/DELETE /api/me/projects/:slug/apis[/:id]` — encrypted API-key submission

## Security
- JWT stored in `localStorage` (access 1h, refresh 30d)
- Auto-Refresh on 401
- All `/api/me/*` calls JWT-gated server-side
- API-Keys encrypted server-side with AES-256-GCM before DB-write
