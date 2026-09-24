"use client";

import { useState } from "react";
import { patientDetailsSchema } from "@/lib/validations";

export function PatientDetailsForm({
  defaultEmail,
  defaultName,
  onBack,
  onContinue,
}: {
  defaultEmail: string;
  defaultName: string;
  onBack: () => void;
  onContinue: (details: Record<string, string>) => void;
}) {
  const [form, setForm] = useState({
    full_name: defaultName,
    date_of_birth: "",
    gender: "",
    phone: "",
    email: defaultEmail,
    reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    // Clear the field error as soon as the user edits it.
    setErrors((e) => {
      if (!e[field]) return e;
      const next = { ...e };
      delete next[field];
      return next;
    });
  }

  function validateField(field: string, value: string) {
    const result = patientDetailsSchema.safeParse({ ...form, [field]: value });
    if (result.success) return;
    const issue = result.error.issues.find((i) => i.path[0] === field);
    if (issue) setErrors((e) => ({ ...e, [field]: issue.message }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = patientDetailsSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] ??= issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    onContinue(form);
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-2xl">
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Patient details</h2>
      <p className="mb-6 text-sm text-slate-500">
        We only need basic information to confirm your appointment.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Patient full name" error={errors.full_name} className="sm:col-span-2">
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            onBlur={(e) => validateField("full_name", e.target.value)}
            aria-invalid={!!errors.full_name}
            className={inputClass(!!errors.full_name)}
            autoComplete="name"
          />
        </Field>

        <Field label="Date of birth" error={errors.date_of_birth}>
          <input
            type="date"
            value={form.date_of_birth}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => set("date_of_birth", e.target.value)}
            onBlur={(e) => validateField("date_of_birth", e.target.value)}
            aria-invalid={!!errors.date_of_birth}
            className={inputClass(!!errors.date_of_birth)}
          />
        </Field>

        <Field label="Gender" error={errors.gender}>
          <select
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
            aria-invalid={!!errors.gender}
            className={inputClass(!!errors.gender)}
          >
            <option value="">Select…</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label="Phone number" error={errors.phone}>
          <input
            type="tel"
            value={form.phone}
            placeholder="+91 98765 43210"
            onChange={(e) => set("phone", e.target.value)}
            onBlur={(e) => validateField("phone", e.target.value)}
            aria-invalid={!!errors.phone}
            className={inputClass(!!errors.phone)}
            autoComplete="tel"
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={(e) => validateField("email", e.target.value)}
            aria-invalid={!!errors.email}
            className={inputClass(!!errors.email)}
            autoComplete="email"
          />
        </Field>

        <Field
          label="Reason for appointment / note (optional)"
          error={errors.reason}
          className="sm:col-span-2"
          hint="A short note for the reception desk — not medical advice or diagnosis."
        >
          <textarea
            value={form.reason}
            onChange={(e) => set("reason", e.target.value)}
            rows={3}
            maxLength={500}
            className={inputClass(!!errors.reason)}
          />
        </Field>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Continue to review
        </button>
      </div>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border bg-white px-3 py-2.5 text-sm ${
    hasError ? "border-red-400 focus:border-red-500" : "border-slate-300"
  }`;
}

function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}