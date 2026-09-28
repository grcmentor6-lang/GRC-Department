#!/usr/bin/env bash
#
# Deploy the site on the machine that serves it.
#
#   ./deploy.sh
#
# Run it as the same user every time — the one that owns the checkout. A build run once under
# sudo leaves root-owned files inside .next, and every later build by the normal user dies with
# "EACCES: permission denied, unlink .next/build/package.json" partway through. If that has
# already happened, clear it once with  sudo rm -rf .next  and never sudo this script.
set -euo pipefail
cd "$(dirname "$0")"

if [ "$(id -u)" = "0" ]; then
  echo "Do not run this as root: it would leave a .next that the deploy user cannot rebuild." >&2
  exit 1
fi

if [ -d .next ] && ! rm -rf .next 2>/dev/null; then
  echo "Cannot remove .next — it holds files owned by another user (a build that ran under sudo)." >&2
  echo "Clear it once with:  sudo rm -rf '$PWD/.next'" >&2
  exit 1
fi

# Either file works: Next reads .env.production for a production build, and .env.local on top of
# it. This server uses .env.production.
if [ ! -f .env.production ] && [ ! -f .env.local ]; then
  echo "No .env.production or .env.local — NEXT_PUBLIC_* values are baked in at build time, so" >&2
  echo "the site would ship pointing at localhost. Copy .env.example to .env.production first." >&2
  exit 1
fi

git pull --ff-only
npm ci
npm run build

# A build on disk changes nothing until the Node process that serves it restarts. Reloading
# nginx is not that: nginx only proxies to port 3001, and the app there keeps serving the build
# it booted with — which looks exactly like a deploy that silently did nothing.
if command -v pm2 >/dev/null 2>&1 && pm2 describe grc-department >/dev/null 2>&1; then
  pm2 reload grc-department --update-env
  echo "Built and reloaded."
else
  echo
  echo "Built — but NOT yet being served. Restart the app process, not nginx:"
  echo "    pm2 restart <name>            # if pm2 runs it:  pm2 list"
  echo "    sudo systemctl restart <name> # if systemd does: ss -lntp | grep 3001"
fi
