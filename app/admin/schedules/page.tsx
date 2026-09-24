import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/session";
import { ScheduleManager } from "@/components/admin/ScheduleManager";

export default async function AdminSchedulesPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/login?next=/admin/schedules");
  if (session.profile?.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const { data: doctors } = await supabase
    .from("doctors")
    .select("id, name, specialty:specialties(name)")
    .eq("is_active", true)
    .order("name");

  const doctorOptions = ((doctors ?? []) as unknown as { id: number; name: string; specialty: { name: string } | null }[])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Schedule management</h1>
      <p className="mb-8 text-sm text-slate-500">
        Create availability for a doctor. Booked slots cannot be made unavailable.
      </p>
      <ScheduleManager doctors={doctorOptions.map((d) => ({ id: d.id, name: d.name, specialty: d.specialty?.name ?? "" }))} />
    </div>
  );
}
