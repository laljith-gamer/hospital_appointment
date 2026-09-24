import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/session";
import { mapDoctor } from "@/lib/queries";
import { AdminDoctorsTable } from "@/components/admin/AdminDoctorsTable";

export default async function AdminDoctorsPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/login?next=/admin/doctors");
  if (session.profile?.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: doctors }, { data: specialties }, { data: hospitals }] = await Promise.all([
    supabase
      .from("doctors")
      .select(
        `id, name, qualification, experience_years, gender, bio, expertise, languages,
         consultation_fee, consultation_type, image_url, is_active,
         specialty:specialties(id, name), hospital:hospitals(id, name, city)`
      )
      .order("name"),
    supabase.from("specialties").select("*").order("name"),
    supabase.from("hospitals").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Doctor management</h1>
      <AdminDoctorsTable
        doctors={((doctors ?? []) as unknown as Parameters<typeof mapDoctor>[0][]).map(mapDoctor)}
        specialties={specialties ?? []}
        hospitals={hospitals ?? []}
      />
    </div>
  );
}
