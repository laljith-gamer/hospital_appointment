import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PrintButton } from "@/components/ui/PrintButton";
import { getAppointmentById } from "@/lib/queries";
import { getSessionProfile } from "@/lib/session";
import { ErrorState } from "@/components/ui/states";
import { appointmentId, formatDate, formatDayName, formatTime, formatFee } from "@/lib/utils";
import { IcsButton } from "@/components/appointments/IcsButton";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const session = await getSessionProfile();

  const appointment = id ? await getAppointmentById(id) : null;

  // Only the patient who booked may see this confirmation.
  if (!appointment || !session || appointment.patient_id !== session.userId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <ErrorState message="We couldn't find this appointment confirmation. Check your appointments page for your bookings." />
        <div className="mt-4 text-center">
          <Link href="/appointments" className="text-sm font-medium text-primary-dark hover:underline">
            View my appointments
          </Link>
        </div>
      </div>
    );
  }

  const apptId = appointmentId(appointment.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="animate-check-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
          <CheckCircle2 className="h-9 w-9" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Appointment Confirmed</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your appointment has been successfully booked. Please arrive 10 minutes early
          for an in-person visit.
        </p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6 text-left">
          <p className="text-lg font-semibold text-slate-900">{appointment.doctor_name}</p>
          <p className="text-sm text-primary-dark">{appointment.specialty_name}</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              <span className="text-slate-500">Date: </span>
              <strong>{formatDayName(appointment.appointment_date)}, {formatDate(appointment.appointment_date)}</strong>
            </p>
            <p>
              <span className="text-slate-500">Time: </span>
              <strong>{formatTime(appointment.appointment_time)}</strong>
            </p>
            <p>
              <span className="text-slate-500">Where: </span>
              <strong>{appointment.hospital_name}</strong>
            </p>
            <p>
              <span className="text-slate-500">Type: </span>
              <strong>{appointment.consultation_type === "video" ? "Video consultation" : "In-person"}</strong>
            </p>
            <p>
              <span className="text-slate-500">Fee: </span>
              <strong>{formatFee(appointment.fee)}</strong>
            </p>
            <p>
              <span className="text-slate-500">Appointment ID: </span>
              <strong>{apptId}</strong>
            </p>
          </div>
        </div>

        <div className="no-print mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/appointments/${appointment.id}`}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            View Appointment
          </Link>
          <IcsButton appointment={appointment} />
          <PrintButton />
          <Link
            href="/appointments"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            My Appointments
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
