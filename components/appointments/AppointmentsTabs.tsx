"use client";

import { useState } from "react";
import { AppointmentCard } from "./AppointmentCard";
import { EmptyState } from "@/components/ui/states";
import type { Appointment } from "@/types/database";

const TABS = ["Upcoming", "Completed", "Cancelled"] as const;

export function AppointmentsTabs({ appointments }: { appointments: Appointment[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Upcoming");

  const today = new Date().toISOString().slice(0, 10);
  const filtered = appointments.filter((a) => {
    if (tab === "Cancelled") return a.status === "cancelled";
    if (tab === "Completed") return a.status === "completed";
    return a.status === "confirmed" || a.status === "pending";
  });

  const upcomingCount = appointments.filter(
    (a) => (a.status === "confirmed" || a.status === "pending") && a.appointment_date >= today
  ).length;

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b border-slate-200" role="tablist" aria-label="Appointment filter">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? "border-primary text-primary-dark"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
            {t === "Upcoming" && upcomingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary-light px-1.5 text-xs text-teal-800">{upcomingCount}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        tab === "Upcoming" ? (
          <EmptyState
            icon="calendar"
            title="No upcoming appointments"
            description="Find a doctor and book your first appointment."
            ctaLabel="Find a Doctor"
            ctaHref="/doctors"
          />
        ) : (
          <EmptyState
            icon="calendar"
            title={`No ${tab.toLowerCase()} appointments`}
            description={`Appointments marked ${tab.toLowerCase()} will appear here.`}
          />
        )
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <AppointmentCard key={a.id} appointment={a} />
          ))}
        </div>
      )}
    </div>
  );
}