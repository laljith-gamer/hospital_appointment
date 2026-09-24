# UX decisions

The brief's core UX problem: *make finding and booking a doctor extremely easy*. Three screens carry that load.

## 1. Doctor search

**Design**: one prominent search box + a persistent left filter rail on desktop; on mobile the filters collapse into a full-height drawer behind a "Filters (n)" button so the vertical card list stays the focus.

- **Keyword search covers conditions, not just labels.** A patient types "heart", not "Cardiology". A small synonym map expands the query so "heart" → Cardiology, "skin" → Dermatology, "bone"/"joint" → Orthopedics, "children"/"kids" → Pediatrics, etc. This is simple normalized matching — no AI search.
- **Search is URL-driven** (`/doctors?q=…&specialty=…`). Every filter state is a link/shareable URL, back/forward works, and results render server-side.
- **Each card answers the four decision questions in priority order**: who (name + verification badge), what (specialty + qualification), can I see them soon (next-availability line), and what does it cost — then a single CTA.
- Empty state offers "Clear Filters" when filters caused the emptiness.

## 2. Slot selection

The old pattern — a dropdown of times — hides availability and creates conflicts. The redesign:

- **Date cards, not a dropdown.** A horizontally scrollable strip of date cards shows weekday/day/month *and the available slot count* ("8 slots"), so the patient can see at a glance which days are worth tapping. Only dates with availability appear; past dates never render.
- **Slots grouped Morning / Afternoon / Evening** in responsive button grids. Times-of-day grouping matches how patients think ("morning appointment").
- **Four explicit slot states**: available (white, hoverable), selected (solid teal, unmistakable), booked (grey, struck through, disabled + tooltip), and a disabled focus ring for keyboard users. Status is not communicated by color alone (strikethrough + disabled + title).
- **Sticky booking summary** beside the selector: doctor, date, time, consultation type, fee, and the Continue button — the patient always sees what they're building.
- **Conflict recovery**: if the slot was taken while booking, the review step explains it in-line and jumps the patient back with slots refreshed — no dead end.

## 3. Booking confirmation

A bare "Success" creates uncertainty. The confirmation screen states, in order:

1. **What** — a large check + "Appointment Confirmed".
2. **With whom** — doctor name and specialty.
3. **When** — full weekday, date and time.
4. **Where** — hospital.
5. **Proof** — appointment ID (APT-XXXXXXXX) and fee.
6. **What next** — View Appointment, Add to Calendar (.ics download), Print, My Appointments, Home.

The print stylesheet hides navigation so "Print" produces a clean confirmation sheet.

## Other deliberate choices

- **Stepper (1 Doctor → 2 Schedule → 3 Details → 4 Confirm)**: the doctor is already chosen when the wizard opens, so step 1 is pre-completed — progress is honest without an extra click.
- **Auth gating at booking, not browsing**: patients can search and compare freely; sign-in is requested only where it's needed (booking). This keeps the funnel's top wide.
- **Mobile is designed, not squeezed**: search-first ordering, filter drawer, full-width date cards, bottom-anchored summary card, 44px+ touch targets.
- **Calm visual identity**: teal primary on a near-white neutral background, rounded-but-quiet cards, subtle shadows, no gradients or glassmorphism — trust and readability over flash.
- **IST everywhere**: dates render as IST wall-clock regardless of browser/server timezone, matching the target users.
