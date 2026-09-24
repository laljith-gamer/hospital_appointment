import { Suspense } from "react";
import { searchDoctors, getFilterOptions } from "@/lib/queries";
import { SearchBar } from "@/components/doctors/SearchBar";
import { DoctorCard } from "@/components/doctors/DoctorCard";
import { DoctorFilters } from "@/components/doctors/DoctorFilters";
import { EmptyState, ErrorState } from "@/components/ui/states";
import type { DoctorSearchParams } from "@/lib/queries";

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<DoctorSearchParams>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Search Doctors</h1>
      <p className="mb-6 text-sm text-slate-500">
        Find the right specialist by name, condition keyword, hospital or availability.
      </p>
      <Suspense fallback={null}>
        <SearchBar />
        <DoctorsBrowser params={params} />
      </Suspense>
    </div>
  );
}

async function DoctorsBrowser({ params }: { params: DoctorSearchParams }) {
  let doctors, filters;
  try {
    [doctors, filters] = await Promise.all([searchDoctors(params), getFilterOptions()]);
  } catch (e) {
    return <ErrorState message={(e as Error).message} />;
  }

  const hasFilters = Object.values(params).some((v) => v);

  return (
    <div className="grid gap-8 md:grid-cols-[260px_1fr]">
      <DoctorFilters
        specialties={filters.specialties}
        hospitals={filters.hospitals}
        active={params as unknown as Record<string, string | undefined>}
      />
      <section aria-label="Doctor results">
        {doctors.length === 0 ? (
          <EmptyState
            title="No doctors found"
            description={
              hasFilters
                ? "Try changing your search or removing some filters."
                : "There are no doctors to show right now. Please check back later."
            }
            ctaLabel={hasFilters ? "Clear Filters" : undefined}
            ctaHref={hasFilters ? "/doctors" : undefined}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
