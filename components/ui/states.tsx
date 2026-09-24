import Link from "next/link";
import { SearchX, AlertTriangle, CalendarX } from "lucide-react";

export function EmptyState({
  icon = "search",
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  icon?: "search" | "calendar";
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const Icon = icon === "calendar" ? CalendarX : SearchX;
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-sm font-medium text-red-800">Something went wrong</p>
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}
