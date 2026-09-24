"use client";

import type { DateOption } from "./BookingWizard";

/** Horizontally scrollable date cards. Dates are date-only strings (YYYY-MM-DD). */
export function DateSelector({
  dates,
  selected,
  onSelect,
}: {
  dates: DateOption[];
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  if (dates.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        This doctor has no upcoming availability right now. Please check back soon.
      </p>
    );
  }

  return (
    <div role="radiogroup" aria-label="Select appointment date">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Select date</h2>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dates.map(({ date, count }) => {
          const d = new Date(`${date}T12:00:00`);
          const isSelected = selected === date;
          const weekday = d.toLocaleDateString("en-IN", { weekday: "short" });
          const month = d.toLocaleDateString("en-IN", { month: "short" });
          return (
            <button
              key={date}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(date)}
              className={`flex w-20 shrink-0 flex-col items-center rounded-xl border px-2 py-3 transition-colors ${
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-primary"
              }`}
            >
              <span className="text-xs uppercase">{weekday}</span>
              <span className="text-lg font-bold">{d.getDate()}</span>
              <span className="text-xs">{month}</span>
              <span className={`mt-1 text-[11px] ${isSelected ? "text-teal-100" : "text-teal-700"}`}>
                {count} slot{count === 1 ? "" : "s"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}