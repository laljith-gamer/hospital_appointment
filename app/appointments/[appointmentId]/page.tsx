import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { getAppointmentById } from "@/lib/queries";
import { AppointmentStatusBadge } from "@/components/ui/StatusBadge";
import { appointmentId, formatDate, formatDayName, formatTime, formatFee } from "@/lib/utils";
import { CancelAppointmentButton } from "@/components/appointments/CancelAppointmentButton";

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId: id } = await params;
  const session = await getSessionProfile();
  const appointment = await getAppointmentById(id);

  if (!appointment || !session || appointment.patient_id !== session.userId) notFound();

  const canAct = appointment.status === "confirmed" || appointment.status === "pending";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/appointments" className="text-sm text-slate-500 hover:text-primary-dark">
        ← Back to appointments
      </Link>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Appointment details</h1>
          <AppointmentStatusBadge status={appointment.status} />
        </div>

        <dl className="mt-6 divide-y divide-slate-100">
          <Row label="Appointment ID" value={appointmentId(appointment.id)} />
          <Row label="Doctor" value={appointment.doctor_name ?? "—"} sub={appointment.specialty_name} />
          <Row label="Hospital" value={appointment.hospital_name ?? "—"} />
          <Row label="Date" value={`${formatDayName(appointment.appointment_date)}, ${formatDate(appointment.appointment_date)}`} />
          <Row label="Time" value={formatTime(appointment.appointment_time)} />
          <Row label="Consultation" value={appointment.consultation_type === "video" ? "Video consultation" : "In-person"} />
          <Row label="Fee" value={formatFee(appointment.fee)} />
          {appointment.reason && <Row label="Note" value={appointment.reason} />}
          <Row label="Booked on" value={new Date(appointment.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
        </dl>

        {canAct && (
          <div className="mt-6 flex gap-3">
            <Link
              href={`/appointments/${appointment.id}/reschedule`}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reschedule
            </Link>
            <CancelAppointmentButton appointmentId={appointment.id} />
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right">
        <span className="font-medium text-slate-900">{value}</span>
        {sub && <span className="block text-xs text-slate-500">{sub}</span>}
      </dd>
    </div>
  );
}