import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>MediBook — a demo hospital appointment booking app. All doctors and hospitals are fictional.</p>
        <div className="flex gap-4">
          <Link href="/doctors" className="hover:text-primary-dark">Find a Doctor</Link>
          <Link href="/login" className="hover:text-primary-dark">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}
