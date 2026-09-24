import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Video, Building2, Globe, Award } from "lucide-react";
import { getDoctorById } from "@/lib/queries";
import { DoctorAvatar } from "@/components/ui/DoctorAvatar";
import { formatFee } from "@/lib/utils";

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;
  const id = Number(doctorId);
  if (!Number.isInteger(id)) notFound();

  const doctor = await getDoctorById(id);
  if (!doctor || !doctor.is_active) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <section className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-5">
          <DoctorAvatar name={doctor.name} imageUrl={doctor.image_url} size="lg" />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-2xl font-bold text-slate-900">{doctor.name}</h1>
              <BadgeCheck className="h-5 w-5 text-teal-600" aria-label="Verified doctor" />
            </div>
            <p className="font-medium text-primary-dark">{doctor.specialty_name}</p>
            <p className="text-sm text-slate-500">{doctor.qualification}</p>
            <p className="mt-1 text-sm text-slate-500">{doctor.experience_years} years experience</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-4 w-4" aria-hidden /> {doctor.hospital_name}
              </span>
              {doctor.hospital_city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden /> {doctor.hospital_city}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Video className="h-4 w-4" aria-hidden />
                {doctor.consultation_type.includes("video") ? "In-person + Video" : "In-person"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="text-lg font-semibold text-slate-900">{formatFee(doctor.consultation_fee)}</p>
          <p className="text-xs text-slate-500">Consultation fee</p>
          <Link
            href={`/doctors/${doctor.id}/book`}
            className="mt-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Book Appointment
          </Link>
        </div>
      </section>

      {/* Details */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-2 font-semibold text-slate-900">About {doctor.name.replace(/^Dr\.?\s*/i, "Dr. ")}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{doctor.bio}</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
            <Award className="h-4 w-4 text-primary-dark" aria-hidden /> Areas of expertise
          </h2>
          <ul className="flex flex-wrap gap-2">
            {(doctor.expertise ?? []).map((item) => (
              <li key={item} className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-teal-800">
                {item}
              </li>
            ))}
          </ul>
          {doctor.languages && (
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <Globe className="h-4 w-4" aria-hidden /> Languages: {doctor.languages.join(", ")}
            </p>
          )}
        </section>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Doctor profiles are fictional demo content for this project and do not describe real practitioners.
      </p>
    </div>
  );
}
