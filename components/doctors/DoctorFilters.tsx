"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Specialty, Hospital } from "@/types/database";

const EXPERIENCE_OPTIONS = [
  { value: "any", label: "Any experience" },
  { value: "0-5", label: "0–5 years" },
  { value: "5-10", label: "5–10 years" },
  { value: "10+", label: "10+ years" },
];

const AVAILABILITY_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This week" },
];

export function DoctorFilters({
  specialties,
  hospitals,
  active,
}: {
  specialties: Specialty[];
  hospitals: Hospital[];
  active: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  function apply(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "any") params.set(key, value);
    else params.delete(key);
    router.push(`/doctors?${params.toString()}`, { scroll: false });
  }

  function clearAll() {
    router.push("/doctors", { scroll: false });
    setOpen(false);
  }

  const activeFilterCount = Object.entries(active).filter(([, v]) => v).length;

  const panel = (
    <FilterPanel
      specialties={specialties}
      hospitals={hospitals}
      active={active}
      apply={apply}
      clearAll={clearAll}
      activeFilterCount={activeFilterCount}
    />
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </button>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-sm font-medium text-primary-dark hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-full overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Filters</h2>
              <button onClick={() => setOpen(false)} aria-label="Close filters" className="rounded p-1 hover:bg-slate-100">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            {panel}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:block">{panel}</aside>
    </>
  );
}

function FilterPanel({
  specialties,
  hospitals,
  active,
  apply,
  clearAll,
  activeFilterCount,
}: {
  specialties: Specialty[];
  hospitals: Hospital[];
  active: Record<string, string | undefined>;
  apply: (key: string, value: string) => void;
  clearAll: () => void;
  activeFilterCount: number;
}) {
  return (
    <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Filters</h2>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-xs font-medium text-primary-dark hover:underline">
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      <FilterGroup label="Specialty">
        <Select value={active.specialty ?? "any"} onChange={(v) => apply("specialty", v)}>
          <option value="any">All specialties</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </Select>
      </FilterGroup>

      <FilterGroup label="Hospital">
        <Select value={active.hospital ?? "any"} onChange={(v) => apply("hospital", v)}>
          <option value="any">All hospitals</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.name}>{h.name}</option>
          ))}
        </Select>
      </FilterGroup>

      <FilterGroup label="Consultation">
        <Select value={active.consultation ?? "any"} onChange={(v) => apply("consultation", v)}>
          <option value="any">Any type</option>
          <option value="in-person">In-person</option>
          <option value="video">Video consultation</option>
        </Select>
      </FilterGroup>

      <FilterGroup label="Gender">
        <Select value={active.gender ?? "any"} onChange={(v) => apply("gender", v)}>
          <option value="any">Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
      </FilterGroup>

      <FilterGroup label="Experience">
        <Select value={active.experience ?? "any"} onChange={(v) => apply("experience", v)}>
          {EXPERIENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </FilterGroup>

      <FilterGroup label="Availability">
        <Select value={active.availability ?? "any"} onChange={(v) => apply("availability", v)}>
          {AVAILABILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
    >
      {children}
    </select>
  );
}