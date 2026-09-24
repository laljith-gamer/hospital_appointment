"use client";

import { CalendarPlus } from "lucide-react";
import type { Appointment } from "@/types/database";

function buildIcs(a: Appointment) {
  const [h, m] = a.appointment_time.split(":").map(Number);
  const start = new Date(`${a.appointment_date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+05:30`);
  const end = new Date(start.getTime() + 30 * 60_000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MediBook//Appointment//EN",
    "BEGIN:VEVENT",
    `UID:${a.id}@medibook`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Hospital Appointment — ${a.doctor_name}`,
    `DESCRIPTION:Specialty: ${a.specialty_name ?? ""}. Type: ${a.consultation_type}.`,
    `LOCATION:${a.hospital_name ?? ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function IcsButton({ appointment }: { appointment: Appointment }) {
  function download() {
    const blob = new Blob([buildIcs(appointment)], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "appointment.ics";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <CalendarPlus className="h-4 w-4" aria-hidden /> Add to Calendar
    </button>
  );
}