"use client";

import Link from "next/link";
import { useState } from "react";
import { AppointmentStatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatTime, formatFee } from "@/lib/utils";
import { cancelAppointment } from "@/lib/actions/appointments";
import type { Appointment } from "@/types/database";

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const a = appointment;
  const canCancel = a.status === "confirmed" || a.status === "pending";

  async function doCancel() {
    setCancelling(true);
    await cancelAppointment(a.id);
    setCancelling(false);
    setConfirming(false);
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900">{a.doctor_name}</h2>
            <AppointmentStatusBadge status={a.status} />
          </div>
          <p className="text-sm text-primary-dark">{a.specialty_name}</p>
          <p className="mt-1 text-sm text-slate-600">
            {formatDate(a.appointment_date, { day: "numeric", month: "short", year: "numeric" })} · {formatTime(a.appointment_time)}
          </p>
          <p className="text-xs text-slate-500">{a.hospital_name} · {formatFee(a.fee)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/appointments/${a.id}`}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            View
          </Link>
          {canCancel && (
            <>
              <Link
                href={`/appointments/${a.id}/reschedule`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Reschedule
              </Link>
              <button
                onClick={() => setConfirming(true)}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {confirming && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4" role="dialog" aria-label="Cancel appointment confirmation">
          <p className="text-sm font-medium text-amber-900">Cancel appointment?</p>
          <p className="mt-1 text-sm text-amber-800">
            Are you sure you want to cancel this appointment? Your history is kept.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700"
            >
              Keep Appointment
            </button>
            <button
              onClick={() => void doCancel()}
              disabled={cancelling}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {cancelling ? "Cancelling…" : "Cancel Appointment"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}