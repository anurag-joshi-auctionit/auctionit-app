# Deploy

Operational notes for running the external portal app on a single Ubuntu host (current testers' box: `10.10.130.137`). It runs under `pm2`; the workflow is `git pull` → restart.

Replace `10.10.130.137` with whatever IP/hostname your box answers on.

## External portal (Vite React)

Serves bidder and client roles at `:3002` / `app.auctionit.ai`.

### `.env.local`

```env
VITE_API_URL=http://10.10.130.137:4000
```

When the browser loads from another machine, `localhost:4000` resolves to the **tester's** machine — point this at the server's actual IP/hostname.

### Vite must bind to all interfaces

`vite.config.ts` must have `server.host: true` (already committed). Without it the dev server only listens on `127.0.0.1` and external IP requests are refused. Verify with:

```bash
pm2 logs auctionit-app --lines 10
# expect BOTH lines:
#   ➜  Local:   http://localhost:3002/
#   ➜  Network: http://10.10.130.137:3002/        ← the one that matters
```

### Start under pm2

```bash
pm2 start "pnpm dev" --cwd ~/auctionit-app --name auctionit-app
pm2 save
```

### Redeploy

```bash
cd ~/auctionit-app
git pull
pnpm install
pm2 restart auctionit-app
```

Hard-refresh the browser (Ctrl-Shift-R) — Vite caches dependencies aggressively.

### Production build path (when stable)

The `build` script runs `tsc --noEmit && vite build`, so it will fail at the type check if there are stale TS errors. Once it builds clean:

```bash
pnpm build       # → dist
pm2 delete auctionit-app
pm2 start "pnpm dlx serve dist -l 3002 -s" \
  --cwd ~/auctionit-app \
  --name auctionit-app
pm2 save
```

The `-s` flag is required — this is an SPA with client-side React Router, so missing routes must rewrite to `index.html`.
