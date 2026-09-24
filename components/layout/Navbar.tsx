import Link from "next/link";
import { Stethoscope } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import type { SessionInfo } from "@/lib/session";

export function Navbar({ session }: { session: SessionInfo | null }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4" aria-label="Main navigation">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
            <Stethoscope className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg">MediBook</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="/doctors" className="hover:text-primary-dark">Find a Doctor</Link>
          {session && <Link href="/dashboard" className="hover:text-primary-dark">Dashboard</Link>}
          {session && <Link href="/appointments" className="hover:text-primary-dark">Appointments</Link>}
          {session?.profile?.role === "admin" && (
            <Link href="/admin" className="hover:text-primary-dark">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href="/profile" className="hidden text-sm text-slate-600 hover:text-primary-dark sm:block">
                {session.profile?.full_name || session.email}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
