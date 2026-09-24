# Testing

## Unit tests (Vitest — `npm test`)

`tests/validations.test.ts` — patient-details Zod schema:

- accepts a valid submission
- rejects missing patient name / invalid email / invalid phone / missing gender / over-long note

`tests/slots.test.ts` — time and slot rules:

- `formatTime` for morning/afternoon/noon/midnight
- `todayInIST` returns a `YYYY-MM-DD` date string
- appointment-ID formatting
- slot grouping into morning/afternoon/evening, including that booked slots stay in their group so the UI can disable them

Result: **13 tests, all passing.**

## Manual verification flow (demo script)

1. Open `/doctors`, search "heart" → Cardiology doctors appear.
2. Filter by hospital + availability → results update in the URL.
3. Open a doctor profile → Book Appointment.
4. Pick a date (slot counts shown) → pick a morning slot → Continue.
5. Fill patient details (try an invalid email → inline error) → Continue to review.
6. Confirm → success screen with appointment ID, .ics download, print.
7. `/appointments` shows the booking under Upcoming.
8. Reschedule to another slot → detail page shows the new time; old slot is released.
9. Cancel → confirmation modal → status becomes Cancelled, slot returns to availability.
10. Admin (role upgraded in Supabase): `/admin` metrics, add/edit/deactivate a doctor, create schedule slots, manage appointment statuses.

## What the tests do and don't cover

The unit suite covers pure logic (validation, formatting, grouping) that doesn't need a live database. Integration against Supabase (real booking, double-booking conflict, RLS) requires a configured project — the double-booking guarantee itself is enforced by the database, and the demo flow above exercises it. To see the conflict path: open the same doctor/date/slot in two browsers, book in both; the second attempt shows "This slot was just booked by another patient."
