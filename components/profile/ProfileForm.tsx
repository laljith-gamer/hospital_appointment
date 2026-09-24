"use client";

import { useState } from "react";
import { profileSchema } from "@/lib/validations";
import { updateProfile } from "@/lib/actions/appointments";

export function ProfileForm({
  initial,
  email,
}: {
  initial: { full_name: string; phone: string; date_of_birth: string; gender: string };
  email: string;
}) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setStatus("saving");
    const res = await updateProfile(form);
    setStatus(res.ok ? "saved" : "error");
    if (!res.ok) setErrors({ _form: res.error ?? "Could not save." });
  }

  const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm";

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6" noValidate>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-600">Email</label>
        <input id="email" value={email} disabled className={`${input} bg-slate-50 text-slate-400`} />
        <p className="mt-1 text-xs text-slate-400">Email can&apos;t be changed here — it&apos;s your sign-in identity.</p>
      </div>

      {(["full_name", "phone", "date_of_birth"] as const).map((field) => (
        <div key={field}>
          <label htmlFor={field} className="mb-1.5 block text-xs font-medium text-slate-600">
            {field === "full_name" ? "Full name" : field === "phone" ? "Phone" : "Date of birth"}
          </label>
          <input
            id={field}
            type={field === "date_of_birth" ? "date" : field === "phone" ? "tel" : "text"}
            value={form[field]}
            onChange={(e) => set(field, e.target.value)}
            aria-invalid={!!errors[field]}
            className={input}
          />
          {errors[field] && <p role="alert" className="mt-1 text-xs text-red-600">{errors[field]}</p>}
        </div>
      ))}

      <div>
        <label htmlFor="gender" className="mb-1.5 block text-xs font-medium text-slate-600">Gender</label>
        <select id="gender" value={form.gender} onChange={(e) => set("gender", e.target.value)} className={input}>
          <option value="">Prefer not to say</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
      </div>

      {status === "saved" && <p className="text-sm text-teal-700">Profile saved.</p>}
      {errors._form && <p role="alert" className="text-sm text-red-600">{errors._form}</p>}

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}