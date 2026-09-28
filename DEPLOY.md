# Deploying grcdepartment.com

The site runs on the VPS at `38.242.247.151`, behind nginx, from
`/var/www/grc-department-frontend/GRC-Department`. It is **not** on Vercel: pushing to GitHub
changes nothing on its own, somebody has to pull and rebuild on that box.

```bash
cd /var/www/grc-department-frontend/GRC-Department
./deploy.sh
```

Run it as the checkout's own user — never with sudo. See below for why.

## The build fails with EACCES

```
Error: EACCES: permission denied, unlink '.../.next/build/package.json'
```

A build ran as root at some point and left root-owned files in `.next`; every later build by the
normal user gets partway through and cannot replace them. Clear it once:

```bash
sudo rm -rf /var/www/grc-department-frontend/GRC-Department/.next
```

Then build as the normal user. `deploy.sh` removes `.next` before each build and refuses to run
as root, so it should not come back.

## Environment

`.env.local` on the server, from `.env.example`. Every `NEXT_PUBLIC_` value is **inlined into the
bundle at build time** — changing one needs a rebuild, not a restart.

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://api.grcmentor.ai
NEXT_PUBLIC_SITE_URL=https://grcdepartment.com
NEXT_PUBLIC_PORTAL_ENABLED=0
NEXT_PUBLIC_CONSULTANTS_ENABLED=0
```

`api.grcmentor.ai` is on the same box and was returning 502 on 2026-09-28 — nginx up, nothing
behind it. While that is true, point `NEXT_PUBLIC_API_BASE_URL` at the Render service
(`https://grc-backend-8smp.onrender.com`) instead, or every brief submission fails in the
browser.

## What is live

- `/brief`, `/scoping`, `/services` — the public path. A brief is stored and emailed to
  `GD_TEAM_EMAIL`.
- `/ops` — the internal queue, its own sign-in, not linked from anywhere.
- `/portal/*` — 404 while `NEXT_PUBLIC_PORTAL_ENABLED` is off.
