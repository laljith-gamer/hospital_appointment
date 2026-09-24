"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { doctorSchema } from "@/lib/validations";
import { upsertDoctor, setDoctorActive } from "@/lib/actions/admin";
import { formatFee } from "@/lib/utils";
import type { Doctor, Specialty, Hospital } from "@/types/database";

export function AdminDoctorsTable({
  doctors,
  specialties,
  hospitals,
}: {
  doctors: Doctor[];
  specialties: Specialty[];
  hospitals: Hospital[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Doctor | "new" | null>(null);

  async function toggleActive(doctor: Doctor) {
    await setDoctorActive(doctor.id, !doctor.is_active);
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={() => setEditing("new")}
        className="mb-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      >
        <Plus className="h-4 w-4" aria-hidden /> Add doctor
      </button>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">All doctors</caption>
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">Name</th>
              <th scope="col" className="px-4 py-3">Specialty</th>
              <th scope="col" className="px-4 py-3">Hospital</th>
              <th scope="col" className="px-4 py-3">Fee</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doctors.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{d.name}</td>
                <td className="px-4 py-3 text-slate-600">{d.specialty_name}</td>
                <td className="px-4 py-3 text-slate-600">{d.hospital_name}</td>
                <td className="px-4 py-3 text-slate-600">{formatFee(d.consultation_fee)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${d.is_active ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
                    {d.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(d)} className="mr-2 inline-flex items-center gap-1 text-xs font-medium text-primary-dark hover:underline">
                    <Pencil className="h-3 w-3" aria-hidden /> Edit
                  </button>
                  <button onClick={() => void toggleActive(d)} className="text-xs font-medium text-slate-500 hover:underline">
                    {d.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <DoctorFormModal
          doctor={editing === "new" ? null : editing}
          specialties={specialties}
          hospitals={hospitals}
          onClose={() => { setEditing(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

function DoctorFormModal({
  doctor,
  specialties,
  hospitals,
  onClose,
}: {
  doctor: Doctor | null;
  specialties: Specialty[];
  hospitals: Hospital[];
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: doctor?.name ?? "",
    specialty_id: String(doctor?.specialty_id ?? ""),
    hospital_id: String(doctor?.hospital_id ?? ""),
    qualification: doctor?.qualification ?? "",
    experience_years: String(doctor?.experience_years ?? ""),
    gender: (doctor?.gender ?? "female") as string,
    bio: doctor?.bio ?? "",
    expertise: (doctor?.expertise ?? []).join(", "),
    languages: (doctor?.languages ?? ["English"]).join(", "),
    consultation_fee: String(doctor?.consultation_fee ?? ""),
    consultation_type: doctor?.consultation_type ?? ["in-person"],
    is_active: doctor?.is_active ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleType(type: string) {
    set("consultation_type",
      form.consultation_type.includes(type)
        ? form.consultation_type.filter((t) => t !== type)
        : [...form.consultation_type, type]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = doctorSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form fields.");
      return;
    }
    setSaving(true);
    const result = await upsertDoctor({ ...parsed.data, id: doctor?.id });
    setSaving(false);
    if (result.ok) onClose();
    else setError(result.error ?? "Could not save.");
  }

  const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="doctor-form-title">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 id="doctor-form-title" className="mb-4 text-lg font-semibold text-slate-900">
          {doctor ? "Edit doctor" : "Add doctor"}
        </h2>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <L label="Name"><input className={`${input} sm:col-span-2`} value={form.name} onChange={(e) => set("name", e.target.value)} required /></L>
          <L label="Specialty">
            <select className={input} value={form.specialty_id} onChange={(e) => set("specialty_id", e.target.value)} required>
              <option value="">Select…</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </L>
          <L label="Hospital">
            <select className={input} value={form.hospital_id} onChange={(e) => set("hospital_id", e.target.value)} required>
              <option value="">Select…</option>
              {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </L>
          <L label="Qualification"><input className={input} value={form.qualification} onChange={(e) => set("qualification", e.target.value)} required /></L>
          <L label="Experience (years)"><input type="number" min={0} className={input} value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)} required /></L>
          <L label="Gender">
            <select className={input} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </L>
          <L label="Consultation fee (₹)"><input type="number" min={0} className={input} value={form.consultation_fee} onChange={(e) => set("consultation_fee", e.target.value)} required /></L>
          <L label="Bio" full><textarea className={`${input} sm:col-span-2`} rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} /></L>
          <L label="Expertise (comma-separated)" full><input className={`${input} sm:col-span-2`} value={form.expertise} onChange={(e) => set("expertise", e.target.value)} /></L>
          <L label="Languages (comma-separated)" full><input className={`${input} sm:col-span-2`} value={form.languages} onChange={(e) => set("languages", e.target.value)} /></L>
          <fieldset className="sm:col-span-2">
            <legend className="mb-1.5 text-xs font-medium text-slate-600">Consultation type</legend>
            <div className="flex gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={form.consultation_type.includes("in-person")} onChange={() => toggleType("in-person")} /> In-person
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={form.consultation_type.includes("video")} onChange={() => toggleType("video")} /> Video
              </label>
            </div>
          </fieldset>
          <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} /> Active (visible in search)
          </label>

          {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {saving ? "Saving…" : "Save doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function L({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}