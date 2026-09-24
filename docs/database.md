# Database design

## Tables

| Table | Purpose |
|---|---|
| `hospitals` | Demo hospitals (name, address, city, phone) |
| `specialties` | Medical specialties |
| `doctors` | Doctor profiles; FK to specialty + hospital; `is_active` gates public visibility |
| `doctor_schedules` | Individual slot rows: `(doctor_id, appointment_date, start_time)` unique, status `available / booked / unavailable` |
| `profiles` | 1:1 with `auth.users`; role `patient / admin`; created by trigger on signup |
| `appointments` | Bookings; FK to patient + doctor; status `pending / confirmed / completed / cancelled` |

Indexes: doctors by specialty/hospital/lower(name); schedules by `(doctor_id, appointment_date, status)`; appointments by patient and by doctor+date.

## Double-booking prevention (three layers)

1. **Partial unique index** — the real guarantee:

```sql
create unique index appointments_no_double_booking
  on appointments(doctor_id, appointment_date, appointment_time)
  where status in ('pending', 'confirmed');
```

Two live appointments for the same doctor/date/time cannot exist, no matter which client, action, or user attempts it. Cancelled/completed rows don't block reuse.

2. **Server action pre-check** — the booking action re-reads the slot and rejects with a friendly conflict message before inserting; the insert error `23505` is mapped to the same message.

3. **Slot sync trigger** — `appointments_sync_slot` marks the schedule row `booked` when a live appointment exists and back to `available` on cancel/complete, so the slot grid and the uniqueness rule stay consistent. Reschedule updates in two steps (status→pending, then date/time+confirmed) so the old slot is released before the new one is claimed; on conflict the appointment is restored to `confirmed`.

## Status transitions

`pending → confirmed`, `confirmed → completed`, `confirmed/pending → cancelled`. The UI and server actions only offer valid transitions; the DB `check` constraint constrains the value set.

## Row Level Security

Every table has RLS enabled:

- Catalog tables (`hospitals`, `specialties`, `doctors`, `doctor_schedules`): public `select` (the app only exposes active doctors in search); all writes require `is_admin()`.
- `profiles`: read/update own row; admins can read all. Role cannot be self-escalated (update check pins `role` to the existing value).
- `appointments`: `select`/`update` limited to `patient_id = auth.uid()` or admin; `insert` limited to the signed-in patient.

`is_admin()` is a `security definer` SQL function so the role check works during RLS evaluation without recursive policy issues.
