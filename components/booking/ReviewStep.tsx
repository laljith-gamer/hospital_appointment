"use client";

import { AlertTriangle } from "lucide-react";
import { BookingSummary } from "./BookingSummary";
import { formatDayName, formatDate, formatTime, formatFee } from "@/lib/utils";
import type { Doctor } from "@/types/database";

export function ReviewStep({
  doctor,
  date,
  slotTime,
  consultationType,
  details,
  onBack,
  onConfirm,
  submitting,
  conflict,
}: {
  doctor: Doctor;
  date: string;
  slotTime: string;
  consultationType: string;
  details: Record<string, string>;
  onBack: () => void;
  onConfirm: () => void;
  submitting: boolean;
  conflict: string | null;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Review appointment</h2>
        <p className="mb-6 text-sm text-slate-500">
          Please check the details below. Confirming will book this appointment.
        </p>

        <dl className="rounded-xl border border-slate-200 bg-white">
          <Row label="Doctor" value={doctor.name} sub={doctor.specialty_name} />
          <Row label="Hospital" value={doctor.hospital_name ?? "—"} />
          <Row label="Date" value={`${formatDayName(date)}, ${formatDate(date)}`} />
          <Row label="Time" value={formatTime(slotTime)} />
          <Row label="Patient" value={details.full_name} />
          <Row label="Consultation" value={consultationType === "video" ? "Video consultation" : "In-person"} />
          {details.reason && <Row label="Note" value={details.reason} />}
          <div className="flex justify-between border-t border-slate-100 px-5 py-4 font-semibold text-slate-900">
            <dt>Fee</dt>
            <dd>{formatFee(doctor.consultation_fee)}</dd>
          </div>
        </dl>

        {conflict && (
          <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div className="text-sm text-amber-800">
              <p className="font-medium">{conflict}</p>
              <button
                type="button"
                onClick={onBack}
                className="mt-1 font-medium underline hover:no-underline"
              >
                Choose another time
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? "Booking…" : "Confirm Appointment"}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Clicking “Confirm Appointment” books this slot immediately.
        </p>
      </div>

      <BookingSummary
        doctor={doctor}
        date={date}
        slotTime={slotTime}
        consultationType={consultationType}
        ctaLabel={submitting ? "Booking…" : "Confirm Appointment"}
        onCta={onConfirm}
        ctaDisabled={submitting}
      />
    </div>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right">
        <span className="font-medium text-slate-900">{value}</span>
        {sub && <span className="block text-xs text-slate-500">{sub}</span>}
      </dd>
    </div>
  );
}