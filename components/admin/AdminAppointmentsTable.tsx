"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AppointmentStatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatTime } from "@/lib/utils";
import { setAppointmentStatus } from "@/lib/actions/admin";
import type { AppointmentStatus } from "@/types/database";

export interface AdminAppointmentRow {
  id: string;
  doctor_name: string;
  specialty_name: string | null;
  hospital_name: string | null;
  patient_name: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  status: AppointmentStatus;
  fee: number;
}

export function AdminAppointmentsTable({ rows }: { rows: AdminAppointmentRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function update(id: string, status: AppointmentStatus) {
    await setAppointmentStatus(id, status as "confirmed" | "completed" | "cancelled");
    startTransition(() => router.refresh());
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">All appointments (most recent 200)</caption>
        <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">Patient</th>
            <th scope="col" className="px-4 py-3">Doctor</th>
            <th scope="col" className="px-4 py-3">Date</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100" aria-busy={pending}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 font-medium text-slate-900">{r.patient_name}</td>
              <td className="px-4 py-3 text-slate-600">
                {r.doctor_name}
                <span className="block text-xs text-slate-400">{r.specialty_name}</span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {formatDate(r.appointment_date)} · {formatTime(r.appointment_time)}
              </td>
              <td className="px-4 py-3"><AppointmentStatusBadge status={r.status} /></td>
              <td className="px-4 py-3">
                <div className="flex gap-2 text-xs">
                  {r.status === "pending" && (
                    <button onClick={() => void update(r.id, "confirmed")} className="font-medium text-teal-700 hover:underline">Confirm</button>
                  )}
                  {r.status === "confirmed" && r.appointment_date < new Date().toISOString().slice(0, 10) && (
                    <button onClick={() => void update(r.id, "completed")} className="font-medium text-slate-600 hover:underline">Mark completed</button>
                  )}
                  {(r.status === "confirmed" || r.status === "pending") && (
                    <button onClick={() => void update(r.id, "cancelled")} className="font-medium text-red-600 hover:underline">Cancel</button>
                  )}
                  {r.status !== "pending" && r.status !== "confirmed" && <span className="text-slate-400">—</span>}
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No appointments yet.</td></tr>
          )}
        </tbody>
      </table>
      <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
        Showing up to 200 most recent appointments.
      </p>
    </div>
  );
}