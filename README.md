# TPC Studio

Product management workspace for Texas Product Catalyst's semester Product Project.

**Status:** Phase 0, frontend prototype with mock data. See [docs/PLAN.md](docs/PLAN.md) for architecture, risks, open questions, and the progress tracker.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # type-check Svelte + TS
npm test           # unit tests (Vitest)
```

In the prototype, any login works. Use the **Prototype** pill at the bottom of the screen to switch between the Team, Mentor, and Admin views.

## Where things live

| Path | What |
|---|---|
| `src/lib/config/product-schema.ts` | **Every My Product field and table.** Edit here to add or rename fields. |
| `src/lib/config/phases.ts` | Journey phases and their GM mapping |
| `src/lib/data/` | Data access. `mock.ts` is placeholder data; `index.ts` is the API pages call |
| `src/lib/data/field-store.ts` | Conflict-safe save logic (tested) |
| `src/lib/stores/workspace.svelte.ts` | My Product autosave state |
| `src/lib/styles/` | Design tokens (`global.scss`) and SCSS mixins (`_tokens.scss`) |
| `src/lib/components/ui/` | Reusable UI: Button, Card, Badge, Modal, Toast, EmptyState… |
| `src/routes/(team)`, `mentor/`, `admin/` | Pages for each role |

## Stack

SvelteKit 2 (Svelte 5) · TypeScript · SCSS · Lucide icons · `@sveltejs/adapter-cloudflare`. Supabase (Postgres + Auth) arrives in Phase 1.
