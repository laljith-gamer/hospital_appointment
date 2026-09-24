import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Stethoscope, UserRound } from "lucide-react";
import { getSessionProfile } from "@/lib/session";
import { getPatientAppointments } from "@/lib/queries";
import { AppointmentStatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatTime } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/login?next=/dashboard");

  const appointments = await getPatientAppointments(session.userId);
  const today = new Date().toISOString().slice(0, 10);
  const next = appointments
    .filter((a) => (a.status === "confirmed" || a.status === "pending") && a.appointment_date >= today)
    .sort((a, b) => (a.appointment_date + a.appointment_time).localeCompare(b.appointment_date + b.appointment_time))[0];
  const recent = appointments.filter((a) => a.id !== next?.id).slice(0, 3);

  const name = session.profile?.full_name?.split(" ")[0] || "there";
  const hour = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {greeting}, {name}
      </h1>

      {/* Next appointment */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6" aria-label="Next appointment">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <CalendarDays className="h-4 w-4" aria-hidden /> Your next appointment
        </h2>
        {next ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">{next.doctor_name}</p>
              <p className="text-sm text-primary-dark">{next.specialty_name}</p>
              <p className="mt-1 text-sm text-slate-600">
                {formatDate(next.appointment_date)} · {formatTime(next.appointment_time)} · {next.hospital_name}
              </p>
            </div>
            <Link
              href={`/appointments/${next.id}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              View Appointment
            </Link>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No upcoming appointments.{" "}
            <Link href="/doctors" className="font-medium text-primary-dark hover:underline">
              Find a doctor
            </Link>
            .
          </p>
        )}
      </section>

      {/* Quick actions */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label="Quick actions">
        {[
          { href: "/doctors", icon: Stethoscope, label: "Find a Doctor" },
          { href: "/appointments", icon: CalendarDays, label: "My Appointments" },
          { href: "/profile", icon: UserRound, label: "Profile" },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary-dark"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            {label}
          </Link>
        ))}
      </section>

      {/* Recent appointments */}
      {recent.length > 0 && (
        <section className="mt-8" aria-label="Recent appointments">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Recent appointments</h2>
          <div className="space-y-3">
            {recent.map((a) => (
              <Link
                key={a.id}
                href={`/appointments/${a.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm hover:border-primary"
              >
                <div>
                  <span className="font-medium text-slate-900">{a.doctor_name}</span>
                  <span className="ml-2 text-slate-500">
                    {formatDate(a.appointment_date)} · {formatTime(a.appointment_time)}
                  </span>
                </div>
                <AppointmentStatusBadge status={a.status} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
