"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSchedule, setSlotStatus, getSchedule } from "@/lib/actions/admin";
import { formatTime } from "@/lib/utils";

const DEFAULT_TIMES = ["09:00", "09:30", "10:00", "10:30", "13:00", "13:30", "14:00", "16:00", "16:30", "17:00"];

interface SlotRow {
  id: number;
  appointment_date: string;
  start_time: string;
  status: string;
}

export function ScheduleManager({
  doctors,
}: {
  doctors: { id: number; name: string; specialty: string }[];
}) {
  const router = useRouter();
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [times, setTimes] = useState<string[]>(DEFAULT_TIMES);
  const [slots, setSlots] = useState<SlotRow[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadSchedule() {
    if (!doctorId) return;
    const result = await getSchedule(Number(doctorId));
    setSlots(result);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!doctorId || !date) {
      setError("Pick a doctor and a date.");
      return;
    }
    setSaving(true);
    const result = await createSchedule({ doctorId: Number(doctorId), date, times });
    setSaving(false);
    if (result.ok) {
      setMessage(`Created ${times.length} slots on ${date}.`);
      void loadSchedule();
      router.refresh();
    } else {
      setError(result.error ?? "Could not create the schedule.");
    }
  }

  async function toggleSlot(slot: SlotRow) {
    const next = slot.status === "available" ? "unavailable" : "available";
    const result = await setSlotStatus(slot.id, next);
    if (result.ok) void loadSchedule();
    else setError(result.error ?? "Could not update the slot.");
  }

  const input = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="doctor" className="mb-1.5 block text-xs font-medium text-slate-600">Doctor</label>
            <select id="doctor" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className={`${input} w-full`}>
              <option value="">Select a doctor…</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date" className="mb-1.5 block text-xs font-medium text-slate-600">Date</label>
            <input id="date" type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className={`${input} w-full`} />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="mb-2 text-xs font-medium text-slate-600">Times (half-hour slots)</legend>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_TIMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimes((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]))}
                aria-pressed={times.includes(t)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  times.includes(t)
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {formatTime(t)}
              </button>
            ))}
          </div>
        </fieldset>

        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        {message && <p className="mt-3 text-sm text-teal-700">{message}</p>}

        <button type="submit" disabled={saving} className="mt-4 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60">
          {saving ? "Creating…" : "Create slots"}
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Existing schedule</h2>
        <button
          type="button"
          onClick={() => void loadSchedule()}
          disabled={!doctorId}
          className="mb-4 rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Load schedule for selected doctor
        </button>
        {slots && (
          <div className="space-y-4">
            {slots.length === 0 && <p className="text-sm text-slate-500">No upcoming slots for this doctor.</p>}
            {Object.entries(
              slots.reduce<Record<string, SlotRow[]>>((acc, s) => {
                (acc[s.appointment_date] ??= []).push(s);
                return acc;
              }, {})
            ).map(([date, daySlots]) => (
              <div key={date}>
                <h3 className="mb-2 text-xs font-medium text-slate-600">{date}</h3>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => void toggleSlot(s)}
                      disabled={s.status === "booked"}
                      title={s.status === "booked" ? "Booked" : "Click to toggle availability"}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                        s.status === "booked"
                          ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                          : s.status === "available"
                            ? "border-teal-200 bg-teal-50 text-teal-700 hover:border-red-300"
                            : "border-slate-200 bg-slate-100 text-slate-400 line-through"
                      }`}
                    >
                      {formatTime(s.start_time)}
                      {s.status === "booked" && " (booked)"}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}