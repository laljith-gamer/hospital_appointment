"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return null;
  return supabase;
}

export async function upsertDoctor(input: {
  id?: number;
  name: string;
  specialty_id: number;
  hospital_id: number;
  qualification: string;
  experience_years: number;
  gender: string;
  bio?: string;
  expertise?: string;
  languages?: string;
  consultation_fee: number;
  consultation_type: string[];
  is_active: boolean;
}): Promise<ActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Admin access required." };

  const row = {
    name: input.name,
    specialty_id: input.specialty_id,
    hospital_id: input.hospital_id,
    qualification: input.qualification,
    experience_years: input.experience_years,
    gender: input.gender,
    bio: input.bio || null,
    expertise: input.expertise
      ? input.expertise.split(",").map((s) => s.trim()).filter(Boolean)
      : null,
    languages: input.languages
      ? input.languages.split(",").map((s) => s.trim()).filter(Boolean)
      : ["English"],
    consultation_fee: input.consultation_fee,
    consultation_type: input.consultation_type,
    is_active: input.is_active,
  };

  const { error } = input.id
    ? await supabase.from("doctors").update(row).eq("id", input.id)
    : await supabase.from("doctors").insert(row);

  if (error) return { ok: false, error: "Could not save the doctor. Please check the fields." };
  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  return { ok: true };
}

export async function setDoctorActive(id: number, isActive: boolean): Promise<ActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Admin access required." };
  const { error } = await supabase.from("doctors").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: "Could not update the doctor." };
  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  return { ok: true };
}

/** Creates a day of slots for a doctor, skipping ones that already exist. */
export async function createSchedule(input: {
  doctorId: number;
  date: string;
  times: string[];
}): Promise<ActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Admin access required." };
  if (!input.times.length) return { ok: false, error: "Pick at least one time slot." };

  const rows = input.times.map((t) => ({
    doctor_id: input.doctorId,
    appointment_date: input.date,
    start_time: t,
    status: "available" as const,
  }));

  const { error } = await supabase.from("doctor_schedules").upsert(rows, {
    onConflict: "doctor_id,appointment_date,start_time",
    ignoreDuplicates: true,
  });

  if (error) return { ok: false, error: "Could not create the schedule." };
  revalidatePath("/admin/schedules");
  return { ok: true };
}

/** Marks an existing slot unavailable (only when nothing is booked on it). */
export async function setSlotStatus(slotId: number, status: "available" | "unavailable"): Promise<ActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Admin access required." };
  const { data: slot } = await supabase
    .from("doctor_schedules")
    .select("status")
    .eq("id", slotId)
    .single();
  if (!slot) return { ok: false, error: "Slot not found." };
  if (slot.status === "booked") {
    return { ok: false, error: "This slot has a booked appointment. Cancel the appointment first." };
  }
  const { error } = await supabase
    .from("doctor_schedules")
    .update({ status })
    .eq("id", slotId);
  if (error) return { ok: false, error: "Could not update the slot." };
  revalidatePath("/admin/schedules");
  return { ok: true };
}

export async function setAppointmentStatus(id: string, status: "confirmed" | "completed" | "cancelled"): Promise<ActionResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Admin access required." };
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) return { ok: false, error: "Could not update the appointment." };
  revalidatePath("/admin/appointments");
  return { ok: true };
}

export async function getSchedule(doctorId: number) {
  const supabase = await requireAdmin();
  if (!supabase) return [];
  const { data } = await supabase
    .from("doctor_schedules")
    .select("id, appointment_date, start_time, status")
    .eq("doctor_id", doctorId)
    .gte("appointment_date", new Date().toISOString().slice(0, 10))
    .order("appointment_date")
    .order("start_time");
  return data ?? [];
}