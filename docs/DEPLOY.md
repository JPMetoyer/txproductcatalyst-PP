# Deploying TPC Studio

TPC Studio runs entirely on free tiers:

| Piece | Service | Account |
|---|---|---|
| Website + server code | Cloudflare Pages (free) | TPC shared email |
| Database + logins | Supabase (free) | TPC shared email |
| Code | GitHub | Currently `JPMetoyer/txproductcatalyst-PP`. Move to a TPC organization later. |
| Domain | `studio.texasproductcatalyst.org`. DNS stays on Netlify. | Whoever manages the Netlify site |

Nothing here needs a credit card. If a free limit is ever reached, the service stops temporarily and never bills you.

---

## 1. Supabase settings (one time)

In the Supabase dashboard for the project:

1. **Turn off public sign-ups.** Go to Authentication → Sign In / Providers and turn **Allow new users to sign up** off.
   Studio creates every account itself. (The database already ignores accounts without a Studio profile, so this is a second layer of protection.)
2. **Rotate the keys that were shared during development.**
   - Project Settings → API Keys → Secret keys: create a new secret key, then delete the old one. Put the new one in `.env` and in Cloudflare (step 3).
   - Database → Settings: reset the database password, then update `SUPABASE_DB_URL` in `.env`.
3. **Apply database changes** from a computer that has the repo and `.env`:
   ```bash
   npm run db:migrate
   ```
   This is safe to run any time. It only applies migration files that haven't run yet.

## 2. Remove demo data and create the first admin (once, before launch)

The development database contains demo teams and accounts. Before real teams use it:

```bash
npm run db:seed -- --wipe-only
```

This deletes **all semesters, teams, documentation, and the demo accounts listed in `.seed-credentials.json`**. It keeps the Career Center library and any accounts not created by the seed script. Then create a real admin account:

```bash
npm run create-admin -- "Full Name"
```

The login and password are printed once. Sign in at `/login`, then go to **Admin → Semester settings** to create the semester, followed by **Challenges, Curriculum, Milestones, Mentors, Teams**. See `docs/ADMIN_GUIDE.md`.

> If you want to keep a sandbox for testing, create a **second free Supabase project** and point a separate `.env` at it. Supabase's free plan includes two projects.

## 3. Cloudflare Pages (one time)

1. Sign in to dash.cloudflare.com with the TPC shared email. Go to **Workers & Pages → Create → Pages → Connect to Git** and pick the GitHub repository.
2. Build settings:
   - Framework preset: **SvelteKit**
   - Build command: `npm run build`
   - Build output directory: `.svelte-kit/cloudflare`
   - Environment variable (build): `NODE_VERSION` = `22`
3. After the first deploy, go to **Settings → Variables and Secrets → Add**, choose type **Secret**, and set
   `SUPABASE_SECRET_KEY` = your secret key. Then trigger a new deployment (Deployments → ⋯ → Retry).
   The public URL and publishable key are already in `wrangler.toml`. If you switch Supabase projects, update them there.
4. Open the `*.pages.dev` address Cloudflare gives you and check that `/api/health` returns `{"ok":true,...}`.

From then on, **every push to `main` deploys automatically.**

## 4. Custom domain

1. In Cloudflare Pages → your project → **Custom domains → Set up a custom domain**, enter `studio.texasproductcatalyst.org`. Cloudflare shows a **CNAME target** like `tpc-studio.pages.dev`.
2. In **Netlify** → Domains → `texasproductcatalyst.org` → DNS settings → **Add new record**:
   - Type: `CNAME`
   - Name: `studio`
   - Value: the target from step 1
3. Wait for Cloudflare to show the domain as **Active** (usually minutes, up to a day). HTTPS is automatic.

The main website on Netlify is unaffected.

## 5. Keep-alive and CI (GitHub Actions)

- **`.github/workflows/keep-alive.yml`** pings `/api/health` every 3 days so the free Supabase project doesn't pause during breaks. Until the custom domain works, set a repository **variable** `STUDIO_URL` (Settings → Secrets and variables → Actions → Variables) to the `pages.dev` address.
  GitHub turns off scheduled workflows after 60 days without commits and emails the owner. Re-enable it from the Actions tab.
- **`.github/workflows/ci.yml`** type-checks, runs unit tests, and builds on every push.

If the project ever does pause: Supabase dashboard → **Restore project**. No data is lost.

## 6. Checking a release locally

```bash
npm run test           # unit tests
npm run preview:cf     # production build in Cloudflare's runtime at http://localhost:8788 (needs .dev.vars)
STUDIO_URL=http://localhost:8788 npm run test:rls   # 45 access-control and feature tests against it
```

`.dev.vars` holds `SUPABASE_SECRET_KEY=...` for local Cloudflare previews. It is git-ignored.

## Free-tier limits (re-check yearly)

- **Supabase free:** 500 MB database, 50k monthly active users, pauses after ~7 days idle (handled by the keep-alive).
- **Cloudflare Pages/Workers free:** 100,000 server requests per day (static files are unlimited), and 10 ms CPU per request. TPC uses a tiny fraction of this.
