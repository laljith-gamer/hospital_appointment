"use client";

import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";
import type { Slot } from "@/types/database";

/** Fetches slots for a date and renders them grouped into Morning / Afternoon / Evening. */
export function TimeSlotGrid({
  doctorId,
  date,
  selected,
  onSelect,
}: {
  doctorId: number;
  date: string;
  selected: string | null;
  onSelect: (time: string | null) => void;
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState<{ key: string; slots?: Slot[]; error?: string } | null>(null);
  const key = `${doctorId}|${date}|${refreshKey}`;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/slots?doctorId=${doctorId}&date=${date}&k=${refreshKey}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Could not load slots"))))
      .then((data) => {
        if (!cancelled) setResult({ key, slots: data.slots });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, error: "Could not load slots. Please try again." });
      });
    return () => {
      cancelled = true;
    };
  }, [doctorId, date, refreshKey, key]);

  // The result for a previous key is ignored while the new fetch is in flight.
  const slots = result?.key === key ? result.slots : undefined;
  const error = result?.key === key ? result.error : undefined;

  // When a conflict message appears (parent re-renders with conflict), refresh.
  useEffect(() => {
    const controller = new AbortController();
    const timer = setInterval(() => setRefreshKey((k) => k), 60_000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, []);

  if (error) {
    return (
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Available slots</h2>
        <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!slots) {
    return (
      <div aria-busy="true" aria-live="polite">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Available slots</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const groups = groupSlots(slots);

  return (
    <div role="radiogroup" aria-label="Select time slot">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Available slots</h2>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="text-xs font-medium text-primary-dark hover:underline"
        >
          Refresh
        </button>
      </div>
      {slots.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          No slots available on this date. Please pick another date.
        </p>
      )}
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-2 text-xs font-medium text-slate-500">{group.label}</h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {group.slots.map((slot) => {
                const isBooked = slot.status !== "available";
                const isSelected = selected === slot.start_time;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isBooked}
                    onClick={() => onSelect(isSelected ? null : slot.start_time)}
                    title={isBooked ? "Not available" : undefined}
                    className={`rounded-lg border px-2 py-2.5 text-sm font-medium transition-colors ${
                      isBooked
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through"
                        : isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary-dark"
                    }`}
                  >
                    {formatTime(slot.start_time)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function groupSlots(slots: Slot[]) {
  const morning: Slot[] = [];
  const afternoon: Slot[] = [];
  const evening: Slot[] = [];
  for (const slot of slots) {
    const h = Number(slot.start_time.split(":")[0]);
    if (h < 12) morning.push(slot);
    else if (h < 16) afternoon.push(slot);
    else evening.push(slot);
  }
  return [
    { label: "Morning", slots: morning },
    { label: "Afternoon", slots: afternoon },
    { label: "Evening", slots: evening },
  ].filter((g) => g.slots.length > 0);
}