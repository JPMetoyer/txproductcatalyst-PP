# TPC Studio

Product management workspace for Texas Product Catalyst's semester Product Project.

**Status:** Phases 1–4 done. All MVP features from the PRD are built on real data. Phase 5 (deployment to `studio.texasproductcatalyst.org`, mobile QA, admin guide) is next. See [docs/PLAN.md](docs/PLAN.md) for architecture, risks, open questions, and the progress tracker.

## Run locally

```bash
npm install
cp .env.example .env   # then fill in the values (see below)
npm run db:migrate     # create tables + access rules in Supabase
npm run db:seed        # demo semester, teams, mentors, admin (logins → .seed-credentials.json)
npm run dev            # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run check` | Type-check Svelte + TS |
| `npm test` | Unit tests (fast, offline) |
| `npm run test:rls` | Access-control tests against the real database, signing in as each role. Set `STUDIO_URL` to a running dev server to also test login + page guards |
| `npm run db:seed -- --reset` | Wipe and reseed demo data (**dev only — deletes everything**) |

### Environment variables (`.env`, never committed)

| Variable | Where to find it | Secret? |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | No |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys | No (RLS protects data) |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret keys | **Yes** (server only) |
| `SUPABASE_DB_URL` | Supabase → Connect → Session pooler | **Yes** (only for migrations) |

### Accounts

There is no public sign-up. Admins create teams under **Admin → Teams**, which generates a login like `team-nestled` and a password that's shown once. Team logins are Supabase Auth users with addresses on `studio.texasproductcatalyst.org`. No email is ever sent to them. **Reset credentials** issues a new password and signs out every device.

## For admins (no code needed)

Everything students see is edited under **Admin**:

- **Semester settings:** create the next semester (optionally copying content), set dates and theme, toggle public marketplace browsing, activate, and archive. Archiving keeps all documentation read-only.
- **Challenge Marketplace / Curriculum / Milestones:** create, edit, reorder, publish/unpublish.
- **Career Center / Demo Day:** edit shared career resources; set the Demo Day date, location, rubric, checklist and judge questions, and see each team's readiness.
- **Teams:** create (login + one-time password), rename, set phase, edit rosters, reset credentials, revoke sessions.
- **Mentors:** create, assign teams, reset password, deactivate.

## Where things live

| Path | What |
|---|---|
| `src/lib/config/product-schema.ts` | **Every My Product field and table.** Edit here to add or rename fields. |
| `src/lib/config/phases.ts` | Journey phases and their GM mapping |
| `src/lib/server/repo.ts` | Database reads for pages (runs as the signed-in user, so RLS applies) |
| `src/lib/server/validate.ts` | Input validation for every write endpoint |
| `src/routes/api/` | Save endpoints: fields, logs, decisions, tasks, milestone readiness |
| `src/lib/tools/` | Business Model Studio math (unit-tested) and Feasibility Explorer areas |
| `src/lib/server/teams.ts`, `admin.ts` | Dashboard summaries and shared admin-editor helpers |
| `scripts/seed-data.ts` | Demo data loaded by `npm run db:seed` |
| `src/lib/stores/workspace.svelte.ts` | My Product autosave state |
| `src/lib/styles/` | Design tokens (`global.scss`) and SCSS mixins (`_tokens.scss`) |
| `src/lib/components/ui/` | Reusable UI: Button, Card, Badge, Modal, Toast, EmptyState… |
| `src/routes/(team)`, `mentor/`, `admin/` | Pages for each role |
| `src/hooks.server.ts` | Session check + which role can open which pages |
| `src/lib/server/` | Server-only code (privileged Supabase client) |
| `supabase/migrations/` | Database schema, access rules (RLS), RPCs |
| `scripts/` | `db-migrate.ts`, `db-seed.ts` |
| `tests/rls/` | Access-control integration tests |

## Stack

SvelteKit 2 (Svelte 5) · TypeScript · SCSS · Lucide icons · `@sveltejs/adapter-cloudflare`. Supabase (Postgres + Auth + RLS) via `@supabase/ssr`.
