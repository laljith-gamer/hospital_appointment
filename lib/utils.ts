import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFee(fee: number) {
  return `₹${fee.toLocaleString("en-IN")}`;
}

/** Formats a time string like "14:30:00" or "14:30" as "02:30 PM". */
export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? "AM" : "PM";
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Formats a date-only string (YYYY-MM-DD) in IST, avoiding timezone drift. */
export function formatDate(date: string, opts?: Intl.DateTimeFormatOptions) {
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString("en-IN", opts ?? { day: "numeric", month: "short", year: "numeric" });
}

export function formatDayName(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { weekday: "long" });
}

/** Today's date as YYYY-MM-DD in Asia/Kolkata regardless of server timezone. */
export function todayInIST() {
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 + now.getTimezoneOffset()) * 60_000);
  return ist.toISOString().slice(0, 10);
}

export function appointmentId(id: string) {
  return `APT-${id.slice(0, 8).toUpperCase()}`;
}
