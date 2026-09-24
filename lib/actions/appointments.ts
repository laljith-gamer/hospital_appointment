"use server";

import { createClient } from "@/lib/supabase/server";
import { patientDetailsSchema } from "@/lib/validations";
import { todayInIST } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  appointmentId?: string;
}

const CONFLICT_MESSAGE =
  "This slot was just booked by another patient. Please choose another time.";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null };
  return { supabase, user };
}

/** Books an appointment. Server-side slot re-check + DB unique index prevent double booking. */
export async function bookAppointment(input: {
  doctorId: number;
  date: string;
  slotTime: string;
  consultationType: string;
  details: {
    full_name: string;
    date_of_birth: string;
    gender: string;
    phone: string;
    email: string;
    reason?: string;
  };
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in to book an appointment." };

  const parsed = patientDetailsSchema.safeParse(input.details);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] ??= issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  // Server-side validation of the slot: must exist, be available, be active doctor, future date.
  const { data: doctor } = await supabase
    .from("doctors")
    .select("id, consultation_fee, consultation_type, is_active")
    .eq("id", input.doctorId)
    .single();

  if (!doctor || !doctor.is_active) return { ok: false, error: "This doctor is not accepting appointments." };
  if (!doctor.consultation_type.includes(input.consultationType)) {
    return { ok: false, error: "This consultation type is not available for this doctor." };
  }
  if (input.date < todayInIST()) return { ok: false, error: "Cannot book a date in the past." };

  const { data: slot } = await supabase
    .from("doctor_schedules")
    .select("id, status")
    .eq("doctor_id", input.doctorId)
    .eq("appointment_date", input.date)
    .eq("start_time", input.slotTime)
    .single();

  if (!slot || slot.status !== "available") {
    return { ok: false, error: CONFLICT_MESSAGE };
  }

  const d = parsed.data;
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: user.id,
      doctor_id: input.doctorId,
      appointment_date: input.date,
      appointment_time: input.slotTime,
      consultation_type: input.consultationType,
      reason: d.reason || null,
      status: "confirmed",
      fee: doctor.consultation_fee,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505" || /appointments_no_double_booking/.test(error.message)) {
      return { ok: false, error: CONFLICT_MESSAGE };
    }
    console.error("booking failed:", error.message);
    return { ok: false, error: "We couldn't complete your booking. Please try again." };
  }

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { ok: true, appointmentId: data.id };
}

export async function cancelAppointment(appointmentId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { data: appt } = await supabase
    .from("appointments")
    .select("id, patient_id, status, appointment_date")
    .eq("id", appointmentId)
    .single();

  if (!appt) return { ok: false, error: "Appointment not found." };
  if (appt.patient_id !== user.id) return { ok: false, error: "You can only cancel your own appointments." };
  if (appt.status !== "confirmed" && appt.status !== "pending") {
    return { ok: false, error: `A ${appt.status} appointment cannot be cancelled.` };
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId);

  if (error) return { ok: false, error: "Could not cancel the appointment. Please try again." };
  revalidatePath("/appointments");
  revalidatePath(`/appointments/${appointmentId}`);
  return { ok: true };
}

/** Reschedules to a new date/slot. Old slot is released by the sync trigger. */
export async function rescheduleAppointment(input: {
  appointmentId: string;
  date: string;
  slotTime: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { data: appt } = await supabase
    .from("appointments")
    .select("id, patient_id, status, doctor_id")
    .eq("id", input.appointmentId)
    .single();

  if (!appt || appt.patient_id !== user.id) return { ok: false, error: "Appointment not found." };
  if (appt.status !== "confirmed") {
    return { ok: false, error: "Only confirmed appointments can be rescheduled." };
  }
  if (input.date < todayInIST()) return { ok: false, error: "Cannot move an appointment to the past." };

  const { data: slot } = await supabase
    .from("doctor_schedules")
    .select("status")
    .eq("doctor_id", appt.doctor_id)
    .eq("appointment_date", input.date)
    .eq("start_time", input.slotTime)
    .single();

  if (!slot || slot.status !== "available") return { ok: false, error: CONFLICT_MESSAGE };

  // Two-step update so the slot-sync trigger releases the old slot first.
  const { error: stepOne } = await supabase
    .from("appointments")
    .update({ status: "pending" })
    .eq("id", input.appointmentId);
  if (stepOne) return { ok: false, error: "Could not reschedule. Please try again." };

  const { error } = await supabase
    .from("appointments")
    .update({
      appointment_date: input.date,
      appointment_time: input.slotTime,
      status: "confirmed",
    })
    .eq("id", input.appointmentId);

  if (error) {
    if (error.code === "23505" || /appointments_no_double_booking/.test(error.message)) {
      // Restore the appointment's original confirmed state.
      await supabase.from("appointments").update({ status: "confirmed" }).eq("id", input.appointmentId);
      return { ok: false, error: CONFLICT_MESSAGE };
    }
    return { ok: false, error: "Could not reschedule. Please try again." };
  }

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${input.appointmentId}`);
  return { ok: true };
}

export async function updateProfile(input: {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      phone: input.phone,
      date_of_birth: input.date_of_birth || null,
      gender: input.gender || null,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: "Could not save your profile. Please try again." };
  revalidatePath("/profile");
  return { ok: true };
}