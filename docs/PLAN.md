# TPC Studio — Architecture & Implementation Plan

Companion to the PRD (v1.0 MVP). This doc covers PRD §22 steps 1–6 and tracks progress.

---

## 1. What we can reuse from the existing TPC website

`~/Desktop/txproductcatalystwebsite` (SvelteKit 2 + Svelte 5 + Tailwind 4 + SCSS):

| Reuse | Notes |
|---|---|
| **Brand tokens** (`src/app.css`) | `--tpc-blue/pink/yellow`, the `--tpc-gradient`, "pop" variants. Ported to SCSS tokens in `src/lib/styles/_tokens.scss`. |
| **Fonts** | Satoshi (display) from Fontshare, free. Studio uses **Inter** for body text per the PRD, with Satoshi for headings so it matches the website. |
| **Logo** | `static/icons/tpc.png` copied into Studio. |
| **Stack choices** | Same SvelteKit 2 / Svelte 5 / TS / `@lucide/svelte` / `sass` versions, so officers only need to learn one stack. |

Not reused: Tailwind (the PRD asks for SCSS, and a single styling approach is easier for future officers), Airtable integration, marketing sections.

**Missing asset:** there is no capybara mascot in the repo. The prototype uses a simple SVG placeholder (`Capybara.svelte`) until official art is supplied.

---

## 2. Technical dependencies & risks

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | **Supabase free projects pause after ~7 days of inactivity.** Over winter or summer break, the app goes offline. | High | Run a free GitHub Actions cron that pings a lightweight endpoint every few days. Document how to un-pause a project. |
| R2 | **Supabase's built-in SMTP is heavily rate-limited** and, on new projects, only sends to org members. Self-serve "forgot password" will not work for teams without custom SMTP. | Medium | MVP: admins rotate team passwords through a server action (no email needed). Optional: a free SMTP provider (Resend free tier or a TPC Gmail app password) if self-serve resets are wanted. |
| R3 | **Session revocation with shared accounts.** An access JWT stays valid until it expires, even after the password changes. | Medium | Set the JWT expiry to about 15 minutes. On every server request, validate the session with `supabase.auth.getUser()` in `hooks.server.ts`, not `getSession()`. Revoke sessions with an admin call (`auth.admin.signOut` / a `SECURITY DEFINER` function that deletes `auth.sessions` rows for that user) and rotate the password. |
| R4 | **Concurrent editing on one shared login.** Saving a whole section at once would overwrite a teammate's work in other fields. | High | Store documentation **per field** (`product_fields` table, see §4) with a `version` integer. Each autosave is an RPC: `save_field(product_id, field_key, value, expected_version)`. On a version mismatch, the RPC returns the newer value, and the UI shows a conflict banner with options to keep mine or take theirs. |
| R5 | **Cloudflare runtime.** SvelteKit on Cloudflare uses `@sveltejs/adapter-cloudflare`. Node-only libraries won't run there. | Low | Use only `@supabase/supabase-js` and `@supabase/ssr`, which work on Workers. Free tier is 100k requests/day, far above TPC's scale. |
| R6 | **Rich text sanitization.** Rich-text editors add dependencies and XSS surface area. | Medium | MVP uses plain-text and lightly formatted textareas, rendered as escaped text. No HTML is stored. Lesson content written by admins is limited to Markdown, rendered with a sanitizer. |
| R7 | **RLS complexity.** Three roles plus mentor assignments plus archived semesters mean policy mistakes could leak data. | High | Centralize checks in SQL helper functions (`is_admin()`, `my_team_id()`, `mentors_team(team_id)`). Add pgTAP or Vitest integration tests that log in as each role and assert access (Acceptance Criteria 7–8). |
| R8 | **Officers with limited technical experience must maintain this.** | Medium | Keep dependencies minimal, make all content database-driven, and write an admin guide and a "how to deploy" README. |

Free-tier figures to re-verify before launch: Supabase (500 MB DB, 50k MAU, 2 free projects, pausing policy) and Cloudflare Pages/Workers (requests/day, builds/month).

**Hosting decision (2026-11-24): Cloudflare Pages, with DNS staying on Netlify.**
- **Why not Netlify:** the main TPC site is hosted on Netlify, but Netlify's Free plan moved to a monthly allowance of 300 credits for new accounts. Page views and function calls both use up credits, and the per-request rates aren't clearly published. Going over pauses the site for the rest of the month.
- **Why Cloudflare:** the free plan gives 100k function requests/day and unlimited free static assets. Going over returns an error for the rest of that day only. It needs no credit card, so there's no way to be charged.
- **Domain setup:** the only DNS change is one CNAME record, `studio` → the Pages project, added in Netlify's DNS panel. `texasproductcatalyst.org` stays on Netlify.
- **Constraint:** the free plan allows 10 ms of CPU time per request. SvelteKit pages that mostly wait on Supabase fit comfortably, but avoid heavy server-side computation.

---

## 3. Project structure

```
tpc-studio/
├─ docs/PLAN.md                 ← this file (progress tracker at bottom)
├─ supabase/
│  ├─ migrations/               ← SQL schema + RLS (Phase 1b)
│  └─ seed.sql
├─ src/
│  ├─ app.html, app.d.ts, hooks.server.ts
│  ├─ lib/
│  │  ├─ styles/                ← _tokens.scss, _mixins.scss, global.scss
│  │  ├─ types/                 ← domain.ts: all TS interfaces mirroring DB
│  │  ├─ config/                ← phases.ts, product-schema.ts (field definitions per phase)
│  │  ├─ data/                  ← repository layer: mock.ts now → supabase.ts later
│  │  ├─ components/
│  │  │  ├─ ui/                 ← Button, Card, Badge, Tabs, Field, Toast, Modal, EmptyState…
│  │  │  ├─ layout/             ← AppShell, Sidebar, PageHeader
│  │  │  └─ product/            ← FieldRenderer, RepeatableTable, SaveIndicator…
│  │  └─ server/                ← supabase admin client (service role, server-only)
│  └─ routes/
│     ├─ login/
│     ├─ (team)/                ← home, challenges, product/[phase], academy, career, demo-day
│     ├─ mentor/                ← home, teams/[id], reviews
│     └─ admin/                 ← overview, teams, mentors, challenges, curriculum, milestones…
```

**Key design choice:** My Product is **driven by configuration**. `product-schema.ts` defines every phase's fields: key, label, type, prompt, example, and an assumption/validated toggle. A single `FieldRenderer` renders them. Adding or renaming a field is a one-line config change, and the same config drives export and the mentor read-only view.

**Data access:** pages call `$lib/data` functions such as `getTeamDashboard(teamId)`. Today these return mock data. In Phase 2 they move to `+page.server.ts` loads backed by Supabase, and the component props don't change.

---

## 4. Database architecture (refinements to PRD §17)

Most tables follow the PRD. These are the changes:

1. **`product_fields`** replaces the single `product_sections.content_json` blob:
   `id, product_id, phase, field_key, value jsonb, status ('assumption'|'validated'|null), version int, updated_at`, unique on `(product_id, field_key)`.
   This gives per-field conflict detection (R4) and lets mentors comment on a specific field.
2. **`log_entries`**: one table for the repeatable logs (`research_interview`, `testing_session`, `iteration`, `competitor`, `feature`), with `kind`, `data jsonb`, `position`, and `version`. Fewer tables and fewer RLS policies. Decisions stay in their own **`product_decisions`** table because they are filtered by status and phase.
3. **`team_mentors`** join table (team_id, mentor_profile_id) instead of `teams.mentor_profile_id`, which allows co-mentors and simpler reassignment. *(See question Q4.)*
4. **`field_comments`**: `id, product_id, field_key, author_profile_id, body, resolved, created_at`. Mentors can insert here but can never write `product_fields`.
5. **`feasibility_assessments`**: `product_id, area, status, notes, evidence, version` (8 rows per product).
6. **`milestone_reviews`** adds `ready_at` (when the team flagged readiness) and `discussion_notes`.
7. **`semesters`** adds `public_marketplace boolean`, `gm_schedule jsonb`, `demo_day jsonb`. This merges `demo_day_settings` into the semester, which removes a table.
8. Soft deletes only (`active`/`archived` flags) on teams, members, and mentors. Roster changes never cascade-delete documentation.

**RLS summary**

| Table group | team | mentor | admin | anon |
|---|---|---|---|---|
| product_*, log_entries, decisions, tasks, feasibility | own team, read and write | assigned teams, read only | all | — |
| field_comments, milestone_reviews | read own team; teams set `ready_at` | assigned teams, read and write | all | — |
| challenges | published, read | published, read | write | published, if `public_marketplace` |
| lessons, resources, career | published, read | published, read | write | — |
| profiles, teams, team_members | own team | assigned teams | all (writes through server actions) | — |

Account creation, password rotation, and session revocation run **only** in SvelteKit server actions using the service-role key. That key is never sent to the browser.

---

## 5. Phased plan

| Phase | Scope | Status |
|---|---|---|
| **0. Frontend prototype** | SvelteKit + SCSS design system, app shells for 3 roles, mock data, priority screens: Login, Team Home, Marketplace, Challenge detail, My Product, Mentor dashboard, Admin overview | **Done, pending review** |
| 1. Foundation | Supabase project, migrations + RLS + seed, `@supabase/ssr` auth, role-based route guards, admin account provisioning actions | **Done.** 20 integration tests pass against the live project |
| 2. Core student experience | Autosave with versioning, logs/tables persisted, decisions, tasks, export (Markdown + print stylesheet) | **Done.** Team pages read and save real data; 27 integration tests |
| 3. Mentorship & admin | Milestone review flow, field comments, team/roster/mentor management, challenge editor, semester settings | **Done.** Comment threads, flags, phase tracking, roster tools, mentors, semester/challenge/curriculum/milestone editors; 46 tests |
| 4. Education & tools | PM Academy CMS, Business Model Studio, Feasibility Explorer, Career Center, Demo Day | |
| 5. Test & deploy | RLS tests per role, concurrent-edit tests, Playwright smoke tests, mobile QA, Cloudflare Pages deploy to `studio.texasproductcatalyst.org` (CNAME in Netlify DNS), admin guide | |

---

## 6. Questions to answer before Phase 1

**Answered so far:** team logins use synthetic `team-<name>` addresses, password resets are admin-only, teams can have several mentors, mentors comment on any field anytime, teams reply and resolve, flags require a note, admins choose whether to rotate credentials on roster changes, the calendar recommends a phase but mentors/admins set it, and teams can rename themselves.

1. **Team login identifier.** Supabase Auth needs an email. Should we use synthetic addresses (`team-slug@studio.<domain>`, shown to students as just a username) or a real shared inbox per team?
2. **Password resets.** Is admin-only rotation acceptable for launch, or do teams need self-serve "forgot password"? Self-serve needs custom SMTP (see R2).
3. ~~Which domain?~~ **Answered:** texasproductcatalyst.org. DNS is on Netlify; Studio goes on Cloudflare Pages via a CNAME.
4. **Mentors per team.** Is it always one, or sometimes co-mentors? The plan assumes a join table either way.
5. **Milestone 4 timing.** After GM7 or after GM8? Should it be configurable per semester? (The plan makes all milestone dates configurable.)
6. **Archived semesters.** Can a team account from a past semester still log in read-only, or are past semesters visible only to admins and mentors?
7. **Demo Day readiness.** Is "team readiness status" self-reported by the team, or set by a mentor or admin?
8. **Capybara art.** Can the Marketing committee provide official mascot illustrations (SVG/PNG)?
9. **Roster privacy.** Is a first name plus last initial enough for roster names (to minimize personal information)?
10. **Team "Settings" page.** Beyond changing the password, what should teams be able to change? (Proposed: team display name only, and a view of the roster.)

---

## 7. Progress tracker (vs PRD §19 MVP scope)

| Requirement | Prototype (mock) | Backend |
|---|---|---|
| Authentication / roles | ☑ | ☑ (Supabase Auth, RLS, route guards) |
| Team dashboard | ☑ | ☑ |
| Challenge Marketplace + detail | ☑ | ☑ (incl. public browsing) |
| Structured product documentation | ☑ (all 8 sections, config-driven) | ☑ |
| Automatic saving + conflict UI | ☑ | ☑ (per-field versions, tested with two sessions) |
| Research / testing / iteration logs | ☑ | ☑ |
| Competitor & feature tables | ☑ | ☑ |
| Decision log | ☑ | ☑ |
| Team tasks | ☑ | ☑ |
| Mentor dashboard | ☑ | ☑ |
| Admin overview | ☑ | ☑ (flags with reason/date/mentor, clearable) |
| Milestone reviews | ☑ | ☑ (team readiness, mentor outcomes, separate from comments) |
| Business Model Studio | ☐ | ☐ |
| Feasibility Explorer | ☐ | ☐ |
| PM Academy / Career / Demo Day | Academy list ☑; Career and Demo Day are placeholders | Academy ☑; rest in Phase 4 |
| Admin CRUD, semester config | ☑ | ☑ (semesters, challenges, curriculum, milestones, teams, mentors) |
| Export | ☑ (Markdown download) | ☑ (from saved data) |
| PM Academy lesson list | ☑ (read-only) | ☑ (team view) |
| Admin teams page | ☑ | ☑ (create, rename, phase, roster, credentials) |
