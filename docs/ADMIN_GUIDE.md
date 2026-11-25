# TPC Studio — Admin Guide

For Academics Committee members who run the Product Project. No coding needed: everything below happens under **Admin** in Studio.

---

## How accounts work

| Account | Who | How it's created | Can see |
|---|---|---|---|
| **Team** | One shared login per team (e.g. `team-nestled`) | Admin → Teams → Create team | Its own team only. It edits all of its documentation. |
| **Mentor** | Professional Committee members | Admin → Mentors → Add mentor | Only the teams assigned to them, read-only. They can comment and record reviews. |
| **Admin** | Academics Committee | Terminal: `npm run create-admin -- "Name"` (see DEPLOY.md) | Everything |

- There is **no sign-up page** and **no "forgot password" email**. When someone loses a password, an admin uses **Reset credentials**, which creates a new password and signs out every device.
- New passwords are **shown once**. Copy them and send them privately, for example as a DM to one team member.
- Renaming a team never changes its login, links, or documentation.

## Semester checklist

### Before the semester
1. **Admin → Semester settings → New semester.** Pick "Copy … from" a previous semester to reuse challenges, curriculum and milestones. Copies start **unpublished with dates cleared**.
2. **Challenge Marketplace:** edit, reorder and **publish** challenges. Turn on *Public read-only Challenge Marketplace* in Semester settings if you want to share the link before teams exist.
3. **Curriculum:** set each GM's **date** (this is the GM schedule) and its *related workspace section*. Publish GMs as the semester goes.
4. **Milestones:** set target dates, review areas and the standard discussion questions mentors will see.
5. **Demo Day:** date, location, expectations, rubric (aim for 100 points), checklist and judge questions.
6. **Make active.** Only one semester can be active. Archive the previous one first.

### Kickoff
1. **Admin → Mentors:** add mentors and copy their logins.
2. **Admin → Teams → Create team:** name, challenge and mentor. Copy the generated login and password, and add roster names with **Add member**.
   Use challenge preferences from the onboarding form to assign challenges.

### During the semester
- **Admin → Overview** shows flagged teams (with the mentor's note), follow-ups, blockers, and milestone progress. Click **Clear** on a flag once it's handled.
- **Phases** are informational. Studio suggests a phase from the GM calendar. Mentors or admins can set a team's actual phase (Admin → Teams, or the mentor's team page). Teams can always edit every section.
- **Roster changes:** click the ✕ next to a member to **remove** them or **move** them to another team. The dialog recommends resetting the team's password and signing out all devices, which is pre-checked. Untick it if the departing member never had the login. **Documentation is never deleted.**

### After Demo Day
- **Semester settings → Archive semester.** Teams can still sign in and read everything, but it's read-only. Public browsing is turned off.
- Teams can download their documentation anytime: **My Product → Export** produces a Markdown file.

## What mentors do

- **Comment** on any field, at any time. The team can reply and resolve, and either side can reopen. Resolved threads stay visible under "Show resolved".
- **Milestone review** (team page → Milestone review tab): feedback, next steps, blockers, and an outcome of *Reviewed* or *Follow-up needed*. Teams see the feedback on their Home page.
- **Flag for Academics** requires a short note, which shows up on your Overview.
- Mentors cannot edit team documentation or see unassigned teams. The database enforces this, not just the screens.

## Content you can edit

| Where | What |
|---|---|
| Semester settings | Name, theme, dates, public marketplace, lifecycle |
| Challenge Marketplace | Cards and full briefs (experience, mission, stakeholders, research considerations, boundaries, expectations) |
| Curriculum | GM schedule, slides, objectives, key concepts, examples, team activity, resources |
| Milestones | Dates, review areas, discussion questions, which sections mentors review |
| Career Center | Frameworks, practice questions, resume bullets, templates, reflection prompts |
| Demo Day | Event details, rubric, checklist, judge questions, resources |

Lists in these editors use **one item per line**. Links must start with `https://`.

## Troubleshooting

| Problem | Fix |
|---|---|
| A team forgot its password | Admin → Teams → **Reset credentials**, then share the new one |
| Someone left the team | Remove them from the roster and keep "reset password" checked |
| A mentor can't see a team | Admin → Mentors → **Assign teams** (or Admin → Teams → Mentor) |
| "No team workspace found" after login | The account isn't attached to a team. Check Admin → Teams |
| The whole site says it can't load data | Supabase may have paused. Open the Supabase dashboard → **Restore project** (see DEPLOY.md) |
| An admin lost their password | Another admin runs `npm run create-admin` for a new account, or resets it in the Supabase dashboard → Authentication → Users |
| Need to change a field's wording in My Product | `src/lib/config/product-schema.ts`. Change the `label` or `prompt`, never the `key` |
