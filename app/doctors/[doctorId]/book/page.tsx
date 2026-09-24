import { notFound } from "next/navigation";
import { getDoctorById, getAvailableDates } from "@/lib/queries";
import { getSessionProfile } from "@/lib/session";
import { BookingWizard } from "@/components/booking/BookingWizard";

export default async function BookAppointmentPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;
  const id = Number(doctorId);
  if (!Number.isInteger(id)) notFound();

  const [doctor, dates, session] = await Promise.all([
    getDoctorById(id),
    getAvailableDates(id),
    getSessionProfile(),
  ]);
  if (!doctor || !doctor.is_active) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Book an appointment</h1>
      <p className="mb-8 text-sm text-slate-500">
        {doctor.name} · {doctor.specialty_name} · {doctor.hospital_name}
      </p>
      <BookingWizard doctor={doctor} dates={dates} defaultEmail={session?.email ?? ""} defaultName={session?.profile?.full_name ?? ""} />
    </div>
  );
}
