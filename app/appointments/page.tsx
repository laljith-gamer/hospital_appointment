import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { getPatientAppointments } from "@/lib/queries";
import { AppointmentsTabs } from "@/components/appointments/AppointmentsTabs";
import { ErrorState } from "@/components/ui/states";

export default async function AppointmentsPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/login?next=/appointments");

  let appointments;
  try {
    appointments = await getPatientAppointments(session.userId);
  } catch {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ErrorState message="We couldn't load your appointments. Please refresh the page." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My Appointments</h1>
      <AppointmentsTabs appointments={appointments} />
      <p className="mt-8 text-center text-sm text-slate-500">
        Looking for a doctor?{" "}
        <Link href="/doctors" className="font-medium text-primary-dark hover:underline">
          Find a Doctor
        </Link>
      </p>
    </div>
  );
}
