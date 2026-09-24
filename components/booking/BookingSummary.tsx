"use client";

import { formatFee, formatDayName, formatDate, formatTime } from "@/lib/utils";
import type { Doctor } from "@/types/database";

export function BookingSummary({
  doctor,
  date,
  slotTime,
  consultationType,
  onConsultationChange,
  ctaLabel,
  onCta,
  ctaDisabled,
  footerNote,
}: {
  doctor: Doctor;
  date: string | null;
  slotTime: string | null;
  consultationType: string;
  onConsultationChange?: (t: string) => void;
  ctaLabel: string;
  onCta: () => void;
  ctaDisabled?: boolean;
  footerNote?: string;
}) {
  return (
    <aside
      className="h-fit rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-6"
      aria-label="Booking summary"
    >
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Appointment summary
      </h2>
      <dl className="space-y-2 text-sm">
        <Row label="Doctor" value={doctor.name} strong />
        <Row label="Specialty" value={doctor.specialty_name ?? "—"} />
        <Row label="Hospital" value={doctor.hospital_name ?? "—"} />
        <Row
          label="Date"
          value={date ? `${formatDayName(date)}, ${formatDate(date)}` : "Not selected"}
          muted={!date}
        />
        <Row label="Time" value={slotTime ? formatTime(slotTime) : "Not selected"} muted={!slotTime} />
        <Row label="Consultation" value={consultationType === "video" ? "Video consultation" : "In-person"} />
        <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold text-slate-900">
          <dt>Consultation fee</dt>
          <dd>{formatFee(doctor.consultation_fee)}</dd>
        </div>
      </dl>

      {onConsultationChange && doctor.consultation_type.includes("video") && (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-600">Consultation type</label>
          <select
            value={consultationType}
            onChange={(e) => onConsultationChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="in-person">In-person</option>
            <option value="video">Video consultation</option>
          </select>
        </div>
      )}

      <button
        type="button"
        onClick={onCta}
        disabled={ctaDisabled}
        className="mt-5 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {ctaLabel}
      </button>
      {footerNote && <p className="mt-2 text-center text-xs text-slate-400">{footerNote}</p>}
    </aside>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right ${strong ? "font-semibold text-slate-900" : muted ? "text-slate-400" : "text-slate-700"}`}>
        {value}
      </dd>
    </div>
  );
}