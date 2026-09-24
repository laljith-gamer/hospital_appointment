import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/session";
import { getProfile } from "@/lib/queries";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const session = await getSessionProfile();
  if (!session) redirect("/login?next=/profile");

  const profile = (await getProfile(session.userId)) ?? {
    id: session.userId,
    email: session.email,
    full_name: null,
    phone: null,
    date_of_birth: null,
    gender: null,
    role: "patient" as const,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Your profile</h1>
      <p className="mb-8 text-sm text-slate-500">Used to pre-fill your appointment details.</p>
      <ProfileForm
        initial={{
          full_name: profile.full_name ?? "",
          phone: profile.phone ?? "",
          date_of_birth: profile.date_of_birth ?? "",
          gender: profile.gender ?? "",
        }}
        email={session.email}
      />
    </div>
  );
}
