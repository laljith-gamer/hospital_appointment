# Architecture

## Overview

MediBook is a Next.js App Router application. Rendering is split deliberately:

- **Server Components** fetch data directly through `lib/queries.ts` (Supabase server client, anon key + user's cookie session, so RLS applies).
- **Client Components** own interactivity: the booking wizard, filters, tabs, forms, modals.
- **Server Actions** (`lib/actions/`) handle all writes — booking, cancelling, rescheduling, admin CRUD. Each action re-verifies the session and re-validates input server-side.
- One API route (`/api/slots`) serves live slot data to the client slot grid; it only reads.

## Request flow (booking)

```
BookingWizard (client)
  ├─ /api/slots            → read availability for a date
  └─ bookAppointment (server action)
       ├─ auth check (Supabase session)
       ├─ Zod validation of patient details
       ├─ doctor active + consultation-type + date checks
       ├─ slot status re-check (must be 'available')
       └─ INSERT into appointments
            └─ unique partial index rejects duplicates → friendly conflict message
```

## Route protection

`middleware.ts` runs `lib/supabase/middleware.ts`, which:

1. Refreshes the Supabase auth cookies on every request.
2. Redirects unauthenticated users away from `/dashboard`, `/appointments`, `/profile`, `/admin` to `/login?next=…`.
3. Redirects non-admin users away from `/admin/*` (reads the profile role).

The `/admin/*` pages re-check the role server-side as well (defense in depth), and RLS is the final backstop.

## Layering

```
app/**/page.tsx      — routing + server data fetch
components/**        — presentation + client interactivity
lib/queries.ts       — all reads (single data-access layer)
lib/actions/**       — all writes (server actions)
lib/supabase/**      — client factories (server, browser, middleware)
lib/validations.ts   — Zod schemas shared by client forms and server actions
```

## Time strategy

Dates are stored as `date` + `time` columns (no instants), and the UI treats them as Asia/Kolkata wall-clock values. `todayInIST()` computes "today" in IST regardless of the server's timezone, so "no past dates" and "today" filters are correct on any host.
