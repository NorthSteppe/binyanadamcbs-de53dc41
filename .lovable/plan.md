## 1. Global header offset (all pages)

Today every page sets its own `pt-*` and the sticky header (h-24 → h-32) overlaps content whenever a page forgets. Fix once at the layout root.

- Add a CSS variable `--header-height` in `index.css`, set to `7rem` mobile / `8rem` desktop.
- Create `<PageShell>` wrapper component that applies `pt-[var(--header-height)]` to its first section, used by every public + portal page.
- Replace ad-hoc `pt-28 / pt-40 / pt-48` on pages with `<PageShell>` (or remove them and let the shell handle it). Contact, About, Services, Login, Signup, Portal dashboard, Staff dashboard, Supervisee dashboard, Admin dashboard, etc.
- Header itself stays sticky / fixed exactly as today; nothing else changes about it.

## 2. Per-role feature flags

New database surface so admins control which portal features each role sees.

```text
public.feature_flags
  key            text PK         -- e.g. 'client.messages'
  label          text             -- 'Messages'
  description    text
  category       text             -- 'client' | 'staff' | 'supervisee' | 'admin'
  default_roles  app_role[]       -- roles that see it out of the box
  is_system      bool             -- seeded flags cannot be deleted

public.role_feature_access
  role           app_role
  feature_key    text references feature_flags(key)
  enabled        bool
  PK(role, feature_key)
```

- Seed ~20 flags covering every portal tile (see section 4).
- RLS: anyone authenticated can `SELECT` (so client app knows what to render); only admins can `INSERT/UPDATE/DELETE`.
- New hook `useFeatureFlags()` returns `{ isEnabled('client.messages'), loading }`. It joins the current user's roles against `role_feature_access`. Cached with React Query.
- Admin page `/admin/features` — grid of flags × roles with toggle switches.

## 3. Bento-minimal portal shell

One shared shell, four role variants.

```text
<PortalShell role="client">
  <PortalHeader greeting subtitle />
  <BentoGrid>
    <BentoTile size="lg" feature="client.next-session"/>
    <BentoTile size="md" feature="client.messages"/>
    <BentoTile size="md" feature="client.tasks"/>
    ...
  </BentoGrid>
</PortalShell>
```

- White canvas, navy text, orange accent. No glass, no metal, no chrome backdrop.
- Tile = rounded-2xl, border `border-border/60`, hover lifts `-translate-y-0.5`, no shadow blur stacks.
- Sizes: `sm` 1×1, `md` 2×1, `lg` 2×2 on a 4-col grid (collapses to 2-col on tablet, 1-col on mobile).
- Each tile is gated by a feature key — if disabled for the user's role, it isn't rendered.
- Existing pages (`/portal/messages`, `/staff/clinical-tools`, etc.) keep their URLs; only the dashboards and chrome change. The deep tools themselves keep working.

## 4. Default feature set per role

Initial seed (admin can change later):

```text
CLIENT  (default ON for role=client)
  client.next-session     Upcoming sessions + book
  client.messages         Messages with care team
  client.tasks            Between-sessions tasks
  client.resources        Shared resources         (default OFF)
  client.toolkit          ACT matrix / mindfulness (default OFF)

THERAPIST  (role=team_member)
  staff.today             Today's sessions
  staff.clients           My clients
  staff.notes             Clinical notes
  staff.tasks             Internal tasks
  staff.tools             Clinical tools          (default OFF)

SUPERVISEE  (role=supervisee)
  sup.next-supervision    Next supervision
  sup.caselog             Case log
  sup.competencies        Competencies
  sup.documents           Documents

ADMIN  (role=admin)
  admin.calendar          Practice calendar
  admin.clients           Clients
  admin.team              Team
  admin.finance           Finance
  admin.content           Site content
  admin.features          Feature toggles         (always ON, locked)
```

## 5. Out of scope this pass

- No change to the deep tool pages themselves (FBA, ACT matrix, etc.) — only the dashboards/chrome around them.
- No change to public marketing pages beyond the header offset fix.
- No change to data model of sessions/notes/etc.

## Order of operations

1. Global header offset + PageShell.
2. DB migration: `feature_flags`, `role_feature_access`, seed, RLS.
3. `useFeatureFlags` hook + admin `/admin/features` page.
4. Shared `PortalShell` + `BentoGrid` + `BentoTile`.
5. Rewrite the four dashboards on top of the new shell.
6. Memory updates.
