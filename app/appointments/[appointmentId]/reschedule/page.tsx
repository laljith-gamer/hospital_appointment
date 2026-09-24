import { notFound } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { getAppointmentById, getAvailableDates } from "@/lib/queries";
import { RescheduleForm } from "@/components/appointments/RescheduleForm";
import { formatDate, formatTime } from "@/lib/utils";

export default async function ReschedulePage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  const session = await getSessionProfile();
  const appointment = await getAppointmentById(appointmentId);

  if (!appointment || !session || appointment.patient_id !== session.userId) notFound();
  if (appointment.status !== "confirmed") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Cannot reschedule</h1>
        <p className="mt-2 text-sm text-slate-600">
          Only confirmed appointments can be rescheduled.
        </p>
      </div>
    );
  }

  const dates = await getAvailableDates(appointment.doctor_id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Reschedule appointment</h1>
      <p className="mb-8 text-sm text-slate-500">
        Currently booked: {appointment.doctor_name} on {formatDate(appointment.appointment_date)} at{" "}
        {formatTime(appointment.appointment_time)}
      </p>
      <RescheduleForm
        appointmentId={appointment.id}
        doctorName={appointment.doctor_name ?? ""}
        doctorId={appointment.doctor_id}
        dates={dates}
      />
    </div>
  );
}
