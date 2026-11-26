# Fall 2026 demo environment

A fictional, fully populated Fall 2026 semester, so people can see what Studio looks like after a full semester of use. **Everything in it is demo data.** Teams, students, interviews, numbers and feedback are invented. GM1–GM8 content is representative rather than historical, and challenge assignments are a retrospective demonstration of the marketplace.

## What's in it

| Area | Contents |
|---|---|
| Semester | Fall 2026, active, Demo Day Dec 5 (10-minute pitch + 3-minute Q&A), Fall 2026 rubric (100 points) |
| Teams | CareerCompass, TechBridge, TravelLens, MoneyMind, RoomSync: 4–5 fictional members each, one mentor each |
| Documentation | Every workspace section, with some fields left blank on purpose so empty states still show. Interview and testing logs match each team's counts. Also included: competitors, feature priorities, iterations, Business Model Studio, Feasibility Explorer, and 4–6 decisions with at least one reversed or reconsidered |
| Mentoring | 4 milestone reviews per team (TechBridge and MoneyMind have a follow-up on the last one), 4–6 comment threads per team (open, resolved, replied, reopened), one support flag on TechBridge |
| Tasks | 6–8 per team, assigned to roster members: done, open, and overdue |
| Content | 8 challenges, 10 GM lessons (StudySpot example throughout), Demo Day checklist and judge questions, extra Career Center items |

No real Figma or Drive links exist; link fields are intentionally blank.

## Accounts

`npm run demo:seed` creates 11 accounts, all with non-deliverable `@example.com` addresses:

| Role | Login |
|---|---|
| Admin | `demo-admin@example.com` |
| Mentors | `demo-mentor-maya-chen@example.com`, `…-daniel-okafor`, `…-priya-raman`, `…-lucas-ferreira`, `…-hannah-kim` |
| Teams | `demo-team-careercompass@example.com`, `demo-team-techbridge`, `demo-team-travellens`, `demo-team-moneymind`, `demo-team-roomsync` (each `@example.com`) |

Passwords are generated and saved to **`.demo-credentials.json`** (git-ignored, never printed). Sign in at `/login` with the full email address.

## Commands

```bash
npm run demo:seed    # create or refresh the demo (safe to re-run; accounts keep their passwords)
npm run demo:reset   # delete all demo data and demo accounts
```

- Demo rows are tagged (`semesters.demo`, `profiles.demo`, `resources.demo`), and reset deletes **only** tagged rows. Real semesters, teams and accounts are never touched.
- Only one semester can be active. If a real semester is active, `demo:seed` stops without changing anything.
- `npm run test:rls` includes `tests/rls/demo.test.ts`. It signs in as every demo account and checks dashboards and access rules (needs a running server and `STUDIO_URL`).

## Before launch

The demo currently lives in the production database. In early January:

1. Run `npm run demo:reset`.
2. Go to **Admin → Semester settings** and set **Spring 2027** back to **Active**. It was switched to *Upcoming* so the demo could be active.
