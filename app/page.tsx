import Link from "next/link";
import { ShieldCheck, CalendarClock, UserRoundCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-16 text-center md:py-24">
        <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
          Hospital appointments, made simple
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Find the right doctor. Book the right time.
        </h1>
        <p className="max-w-xl text-slate-600">
          Search specialists, explore availability, and book hospital appointments
          in a few simple steps.
        </p>
        <form action="/doctors" className="flex w-full max-w-lg gap-2">
          <input
            type="search"
            name="q"
            placeholder="Search doctor, specialty or hospital…"
            aria-label="Search doctors"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Find a Doctor
          </button>
        </form>
        <Link href="/appointments" className="text-sm font-medium text-primary-dark hover:underline">
          View my appointments
        </Link>
      </section>

      {/* Trust section */}
      <section className="grid gap-4 pb-20 sm:grid-cols-3" aria-label="Why MediBook">
        {[
          {
            icon: UserRoundCheck,
            title: "Verified doctors",
            text: "Browse specialists across departments with clear qualifications and experience.",
          },
          {
            icon: CalendarClock,
            title: "Real-time slot availability",
            text: "See open time slots as you pick a date — no calls, no waiting rooms.",
          },
          {
            icon: ShieldCheck,
            title: "Easy appointment management",
            text: "Reschedule or cancel in a tap, with your full appointment history in one place.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border border-slate-200 bg-white p-6">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
