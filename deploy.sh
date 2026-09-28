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

if [ ! -f .env.local ]; then
  echo "No .env.local — NEXT_PUBLIC_* values are baked in at build time, so the site would" >&2
  echo "ship pointing at localhost. Copy .env.example and fill it in first." >&2
  exit 1
fi

git pull --ff-only
npm ci
npm run build

# Whatever keeps `npm start` alive. pm2 if it is installed; otherwise say so rather than
# leaving a fresh build unserved and looking like nothing happened.
if command -v pm2 >/dev/null 2>&1 && pm2 describe grc-department >/dev/null 2>&1; then
  pm2 reload grc-department --update-env
  echo "Built and reloaded."
else
  echo "Built. Now restart whatever serves it, e.g.:  sudo systemctl restart grc-department"
fi
