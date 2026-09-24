import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/session";
import { AdminAppointmentsTable } from "@/components/admin/AdminAppointmentsTable";
import type { AppointmentStatus } from "@/types/database";

export default async function AdminAppointmentsPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/login?next=/admin/appointments");
  if (session.profile?.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(
      `id, appointment_date, appointment_time, consultation_type, reason, status, fee,
       doctor:doctors(name, specialties(name), hospitals(name)),
       patient:profiles(full_name, email)`
    )
    .order("appointment_date", { ascending: false })
    .order("appointment_time")
    .limit(200);

  const rows = ((data ?? []) as unknown as {
    id: string;
    appointment_date: string;
    appointment_time: string;
    consultation_type: string;
    status: string;
    fee: number;
    doctor: { name: string; specialties: { name: string } | null; hospitals: { name: string } | null } | null;
    patient: { full_name: string | null; email: string | null } | null;
  }[]).map((row) => ({
    id: row.id,
    doctor_name: row.doctor?.name ?? "—",
    specialty_name: row.doctor?.specialties?.name ?? null,
    hospital_name: row.doctor?.hospitals?.name ?? null,
    patient_name: row.patient?.full_name ?? row.patient?.email ?? "—",
    appointment_date: row.appointment_date,
    appointment_time: row.appointment_time.slice(0, 5),
    consultation_type: row.consultation_type,
    status: row.status as AppointmentStatus,
    fee: Number(row.fee),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">All appointments</h1>
      <AdminAppointmentsTable rows={rows} />
    </div>
  );
}
