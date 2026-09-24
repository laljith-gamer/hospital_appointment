import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/session";
import { todayInIST } from "@/lib/utils";

export default async function AdminDashboard() {
  const session = await getSessionProfile();
  if (!session) redirect("/login?next=/admin");
  if (session.profile?.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const today = todayInIST();

  const [doctors, appointments] = await Promise.all([
    supabase.from("doctors").select("id, is_active", { count: "exact" }),
    supabase
      .from("appointments")
      .select("id, status, appointment_date", { count: "exact" }),
  ]);

  const all = appointments.data ?? [];
  const totalDoctors = doctors.count ?? 0;
  const activeDoctors = (doctors.data ?? []).filter((d) => d.is_active).length;
  const todays = all.filter((a) => a.appointment_date === today && a.status !== "cancelled").length;
  const upcoming = all.filter((a) => a.appointment_date > today && a.status !== "cancelled").length;
  const cancelled = all.filter((a) => a.status === "cancelled").length;

  const stats = [
    { label: "Doctors", value: `${activeDoctors} active / ${totalDoctors}` },
    { label: "Appointments (all time)", value: appointments.count ?? 0 },
    { label: "Today's appointments", value: todays },
    { label: "Upcoming", value: upcoming },
    { label: "Cancelled", value: cancelled },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { href: "/admin/doctors", label: "Manage doctors" },
          { href: "/admin/schedules", label: "Manage schedules" },
          { href: "/admin/appointments", label: "View appointments" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border border-slate-200 bg-white p-5 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary-dark"
          >
            {l.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
