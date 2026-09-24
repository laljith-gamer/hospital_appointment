import Link from "next/link";
import { BadgeCheck, MapPin, Video, Building2 } from "lucide-react";
import { DoctorAvatar } from "@/components/ui/DoctorAvatar";
import { formatFee, formatTime } from "@/lib/utils";
import type { Doctor } from "@/types/database";

interface NextAvailable {
  date: string;
  time: string;
}

export function DoctorCard({ doctor, nextAvailable }: { doctor: Doctor; nextAvailable?: NextAvailable }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <DoctorAvatar name={doctor.name} imageUrl={doctor.image_url} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate font-semibold text-slate-900">{doctor.name}</h2>
            <BadgeCheck className="h-4 w-4 shrink-0 text-teal-600" aria-label="Verified doctor" />
          </div>
          <p className="text-sm font-medium text-primary-dark">{doctor.specialty_name}</p>
          <p className="text-xs text-slate-500">{doctor.qualification}</p>
          <p className="text-xs text-slate-500">{doctor.experience_years} years experience</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5" aria-hidden /> {doctor.hospital_name}
        </span>
        {doctor.hospital_city && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {doctor.hospital_city}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          {doctor.consultation_type.includes("video") ? (
            <>
              <Video className="h-3.5 w-3.5" aria-hidden /> In-person + Video
            </>
          ) : (
            "In-person only"
          )}
        </span>
      </div>

      <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{formatFee(doctor.consultation_fee)}</p>
          <p className="text-xs text-teal-700">
            {nextAvailable
              ? `Next available: ${nextAvailable.date === "today" ? "Today" : nextAvailable.date}, ${formatTime(nextAvailable.time)}`
              : "Availability on profile"}
          </p>
        </div>
        <Link
          href={`/doctors/${doctor.id}`}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}
