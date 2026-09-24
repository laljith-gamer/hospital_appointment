import { DoctorGridSkeleton } from "@/components/doctors/DoctorCardSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 h-16 w-64 animate-pulse rounded-lg bg-slate-100" />
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
        <DoctorGridSkeleton />
      </div>
    </div>
  );
}
