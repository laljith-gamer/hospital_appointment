"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateSelector } from "@/components/booking/DateSelector";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { rescheduleAppointment } from "@/lib/actions/appointments";

interface DateOption {
  date: string;
  count: number;
}

export function RescheduleForm({
  appointmentId,
  doctorId,
  doctorName,
  dates,
}: {
  appointmentId: string;
  doctorId: number;
  doctorName: string;
  dates: DateOption[];
}) {
  const router = useRouter();
  const [date, setDate] = useState<string | null>(null);
  const [slotTime, setSlotTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!date || !slotTime) return;
    setSubmitting(true);
    setError(null);
    const result = await rescheduleAppointment({ appointmentId, date, slotTime });
    setSubmitting(false);
    if (result.ok) {
      router.push(`/appointments/${appointmentId}`);
      router.refresh();
    } else {
      setError(result.error ?? "Could not reschedule. Please try again.");
      setSlotTime(null);
    }
  }

  return (
    <div className="max-w-3xl">
      <DateSelector dates={dates} selected={date} onSelect={(d) => { setDate(d); setSlotTime(null); }} />
      {date && (
        <div className="mt-6">
          <TimeSlotGrid doctorId={doctorId} date={date} selected={slotTime} onSelect={setSlotTime} />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.push(`/appointments/${appointmentId}`)}
          disabled={submitting}
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={() => void submit()}
          disabled={!date || !slotTime || submitting}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Rescheduling…" : `Confirm new time with ${doctorName}`}
        </button>
      </div>
    </div>
  );
}