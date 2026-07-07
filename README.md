# GTA Mod Launcher

Desktop mod launcher for GTA V (Electron) plus a marketing site (Next.js).

## Vercel deployment (landing site only)

The **Root Directory** must be `landing`. If Vercel builds from the repo root, it will try to build the Electron app and fail.

1. Vercel → your project → **Settings** → **General**
2. **Root Directory** → Edit → enter `landing` → Save
3. **Deployments** → Redeploy the latest commit

Optional env vars (Project → Settings → Environment Variables):

- `NEXT_PUBLIC_DOWNLOAD_URL` — GitHub release `.exe` URL
- `NEXT_PUBLIC_DISCORD_URL` — Discord invite link

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

Output: `release/GTA Mod Launcher-{version}-setup.exe`
