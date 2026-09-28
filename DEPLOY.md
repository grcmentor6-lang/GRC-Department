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

`.env.production` on the server, from `.env.example` (`.env.local` also works and wins where both set the same key). Every `NEXT_PUBLIC_` value is **inlined into the
bundle at build time** — changing one needs a rebuild, not a restart.

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://api.grcmentor.ai
NEXT_PUBLIC_SITE_URL=https://grcdepartment.com
NEXT_PUBLIC_PORTAL_ENABLED=0
NEXT_PUBLIC_CONSULTANTS_ENABLED=0
```

`api.grcmentor.ai` is the production API, on this same box. The Render service
(`https://grc-backend-8smp.onrender.com`) runs the same code and is the fallback while that one
is down — it 502'd for part of 2026-09-28, nginx up with nothing behind it, which is worth
checking first if every form on the site starts failing at once.

## What is live

- `/brief`, `/scoping`, `/services` — the public path. A brief is stored and emailed to
  `GD_TEAM_EMAIL`.
- `/ops` — the internal queue, its own sign-in, not linked from anywhere.
- `/portal/*` — 404 while `NEXT_PUBLIC_PORTAL_ENABLED` is off.

## The build worked but the site did not change

nginx only proxies to the Node process on port 3001. That process serves the build it booted
with, so a rebuild needs **the app** restarted, not nginx:

```bash
pm2 list                                    # if pm2 runs it
ss -lntp | grep 3001                         # otherwise, find what is listening
systemctl list-units --type=service | grep -iE "grc|next|department"
```

Then `pm2 restart <name>` or `sudo systemctl restart <name>`. `systemctl reload nginx` will
never pick up a new build.

## Never build with sudo

`sudo npm run build` leaves a root-owned `.next` and a root-owned `.git`, and the next ordinary
build and `git pull` both fail. If it has happened:

```bash
sudo chown -R secureitlab:secureitlab /var/www/grc-department-frontend/GRC-Department
```
