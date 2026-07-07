# ModHarbor

Desktop mod launcher for GTA V (Electron) plus a marketing site (Next.js).

## Vercel deployment (landing site only)

Root `vercel.json` builds only the `landing/` Next.js site as a static export (`landing/out`).
You do **not** need to set a Root Directory in Vercel — redeploy after pushing.

Optional env vars (Project → Settings → Environment Variables):

- `NEXT_PUBLIC_DOWNLOAD_URL` — GitHub release `.exe` URL
- `NEXT_PUBLIC_DISCORD_URL` — Discord invite link

> Env vars must be set in Vercel before build; they are baked into the static export at build time.

## Local development

```bash
# Electron app
npm install
npm run dev

# Landing site
cd landing && npm install && npm run dev
```

## Windows installer

```bash
npm run build:win
```

Output: `release/ModHarbor-{version}-setup.exe` (executable: `ModHarbor.exe`)
