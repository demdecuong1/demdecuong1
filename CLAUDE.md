# CLAUDE.md — Engineering & Design Rules

Claude Code reads this file automatically every session. Follow it exactly.
The product brief is in `SPEC.md`. When something here conflicts with a request, ask before deviating.

---

## Project

Internal service case management portal for Evident (see `SPEC.md`). Local-first. TypeScript everywhere.

## Stack (do not swap without asking)

- Next.js (App Router) + TypeScript
- Supabase: Postgres, Auth, Storage, Row Level Security (RLS)
- **MUI (Material UI v6)** implementing **Google Material Design 3** — install with
  `@mui/material @emotion/react @emotion/styled`. Use MUI X Charts for dashboards.
- Git for version control

## Repo conventions

- `app/` route segments; colocate route-specific components.
- `components/` shared app components built on MUI.
- `theme/` — the single MUI theme (Material 3 tokens). All styling flows from it.
- `lib/` clients and helpers; `lib/supabase/` for server + client instances.
- `lib/data/` — **all** database access goes through here. Screens never query Supabase directly.
- `lib/auth/` — role/scope checks live here and are reused everywhere.
- Prefer server components; use client components only when interactivity requires it.

## Hard rules (these prevent the project's biggest risks)

1. **Every case query is scope-filtered** via the auth-scoped data layer in `lib/data/`. Partners must
   never receive another tracker's data — enforce with Supabase RLS **and** in the data layer. Never
   rely on the UI to hide data.
2. **Every case mutation writes a `case_events` audit row** (who, when, field, old value, new value);
   status changes use `event_type = 'status_change'`. Do this in the data layer.
3. **Every relevant mutation also creates `notifications`** for the users who should be alerted —
   respecting their scope/permissions and preferences. Never notify about unseen data.
4. **Dynamic fields are metadata-driven.** Render case fields from `field_definitions`, filtered by the
   user's role. Never hardcode the dynamic field list. Deprecating a field never deletes stored values.
5. **Per-field visibility is applied server-side** before data reaches the client.
6. **Change awareness is derived from data, not guessed.** Use `case_views.last_seen_at` vs `case_events`
   to compute what's new per user (see Design — Change awareness).
7. **Write tests for permission, scope, and notification-targeting logic first** — the riskiest surface.

## Definition of done (per feature)

- Loading, empty, error, and permission-denied states handled.
- Scope + permissions enforced server-side and covered by a test.
- Audit events + notifications written for relevant changes.
- Responsive to mobile; keyboard focus visible; forms have inline validation.
- Diff reviewed and committed with a clear message.

---

## UI / UX design direction — Material Design 3

The design system is **Google Material Design 3**, implemented via **MUI**. Follow Material 3 conventions;
don't invent a parallel design language. This is a **data-dense internal operations tool**, so favor the
clearer, calmer end of Material 3 (think Google Workspace admin / Cloud Console), not playful Material You.

### Theme (define once in `theme/`, reuse everywhere)

- **Color:** a Material 3 color scheme generated from a single brand **primary** seed (#2FF7B8), using M3 color
  **roles** (primary, secondary, surface, surface-variant, outline, error). Pick the brand seed = #2FF7B8.
  Support light mode first; dark mode later via the same roles.
- **Status colors:** map each case status to a consistent M3 tonal palette + label; render status as an
  **M3 chip/badge** identically everywhere it appears.
- **Typography:** the Material 3 type scale (display / headline / title / body / label). One UI sans
  (Roboto or a close M3-appropriate face); a **monospace** for `case_number` and serial numbers.
- **Shape & elevation:** M3 rounded corners and elevation tokens; use **cards** to group sections, tonal
  surfaces for grouping, hairline outlines over heavy borders.
- **Components:** use MUI's Material components directly — AppBar, NavigationRail/Drawer, Card, Chip,
  DataGrid/Table, Tabs, Dialog, Snackbar, Badge, Menu, TextField. Don't restyle them into a non-Material look.

### Layout patterns

- **Shell:** Material top app bar + left navigation. App bar carries the **notification bell with a Badge**
  showing unread count, plus user/role and region/tracker context.
- **Case list:** MUI table/DataGrid. **Header shows the total count** ("Cases — 128"). Filters as chips /
  selects. Rows with unseen updates are marked (leading dot / bold) + "Updated {relative}".
- **Case detail:** sticky header (case number + status chip + actions), a change banner, then MUI Tabs
  (Overview / Documents / Activity / History). Overview = grouped Cards per `SPEC.md §6.2`.

### Change awareness (make updates obvious)

- Compute "unseen" from `case_views.last_seen_at` vs `case_events`.
- **List:** dot/bold + relative time on updated rows.
- **Detail banner:** "N fields updated since your last visit" (status change called out first).
- **Field level:** changed fields get a subtle **tonal (surface-variant) background** + a small "Updated"
  chip; status is the most prominent. Mark case seen on open.

### Notifications UX

- Bell + unread **Badge** in the app bar; click opens an M3 menu list; a full Notifications page mirrors it.
- Each item: type icon, case number, actor, relative time, read/unread; click navigates to the case.
- Use **Snackbar** for transient confirmations (e.g. "Case updated"), not for persistent notifications.

### Copy

- Buttons say what they do ("Create case", "Save changes"); an action keeps its name through the flow
  (a "Publish" button → "Published" snackbar). Sentence case, plain verbs, no filler.
- Empty states invite action; errors say what went wrong and how to fix it, never vague or apologetic.

### Build order for UI

1. Set up the MUI **theme** (M3 tokens) + shared components (StatusChip, SectionCard, DataTable,
   PageHeader with count, NotificationBell) **before** screens.
2. Then build screens per `SPEC.md §7`, one at a time.
3. After each screen, screenshot and review it against Material 3 + this direction; refine.
