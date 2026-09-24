# MediBook — Hospital Appointment Booking

A production-style hospital appointment booking web app built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase** (PostgreSQL + Auth). Patients can search doctors, pick an available slot, and book with real double-booking prevention; admins can manage doctors, schedules, and appointments.

> All doctors, hospitals and details are **fictional demo data**. This is an appointment-booking demo, not a medical system — no diagnosis, treatment or prescriptions.

## Core UX flow

```
Find a Doctor → Doctor Profile → Select Date → Select Slot
→ Patient Details → Review → Confirm → ✓ Appointment Confirmed
```

The flow is guided by a 4-step stepper (Doctor → Schedule → Details → Confirm), with a sticky booking summary on desktop and a summary card on mobile.

## Features

- **Doctor search** — keyword search across name / specialty / hospital with condition synonyms ("heart" → Cardiology, "bone" → Orthopedics).
- **Filters** — specialty, hospital, consultation type, gender, experience range, availability (today / tomorrow / this week), combined + clearable.
- **Doctor profiles** — qualification, experience, bio, expertise, languages, fee.
- **Slot selection** — horizontal date cards with per-day slot counts; slots grouped Morning / Afternoon / Evening with Available / Selected / Booked states.
- **Booking** — validated patient form (Zod), review screen, server-side slot re-check + DB unique index for double-booking prevention, conflict messaging that refreshes slots.
- **Appointments** — upcoming / completed / cancelled tabs, detail page, cancel (with confirmation modal), reschedule (old slot released).
- **Confirmation** — success screen with appointment ID, Add to Calendar (.ics), and print support.
- **Auth** — Supabase magic-link (email OTP) sign-in; public browsing, auth required to book.
- **Admin** — dashboard metrics, doctor CRUD, schedule management, appointment status management. Role-gated via middleware + RLS.
- **States** — skeletons for loading, empty states, friendly error states everywhere.

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Supabase (ssr + js) · Zod · Lucide icons · Vitest

## Folder structure

```
app/                  # App Router pages (login, dashboard, doctors, appointments, admin, api)
components/           # layout/, doctors/, booking/, appointments/, admin/, profile/, ui/
lib/
  supabase/           # server + browser clients, middleware session refresh
  actions/            # server actions (booking, admin)
  queries.ts          # data access layer
  validations.ts      # Zod schemas
  utils.ts            # date/time/fee formatting (IST)
supabase/migrations/  # 001_schema.sql (schema+RLS), 002_seed.sql (demo data)
types/                # shared types
tests/                # Vitest unit tests
docs/                 # architecture.md, database.md, ux-decisions.md, testing.md
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/migrations/001_schema.sql` then `supabase/migrations/002_seed.sql`.
   The seed generates 14 days of slots from the day you run it.
3. **Authentication → Providers → Email**: enable email magic links. For local demos you can disable "Confirm email" so OTP links work instantly.
4. Add your project URL and anon key to `.env.local` (see `.env.example`):

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

The **service role key is never used or committed** — all client code uses the anon key and relies on RLS.

## Running locally

```bash
npm install
npm run dev
```

```bash
npm run lint
npm run build
npm test
```

## Creating users (demo / admin)

- **Patient**: open the site → *Sign in* → enter any email → follow the magic link. A profile row is created automatically by the `on_auth_user_created` trigger.
- **Admin**: create a patient account first, then in the Supabase SQL editor run:

```sql
update public.profiles set role = 'admin' where email = 'admin@example.com';
```

Sign in with that email and the `/admin` area unlocks (middleware + RLS both enforce the role).

## Security notes

- Row Level Security is enabled on every table; patients only see/modify their own appointments and profile; admin writes check the `role` via a `security definer` `is_admin()` function.
- Booking availability is re-validated **server-side** on every attempt; the client never decides whether a slot is bookable.
- Double-booking is impossible at the DB level (see [docs/database.md](docs/database.md)).

See [docs/](docs/) for architecture, database design, UX decisions, and testing notes.
