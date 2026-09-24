import { createClient } from "@/lib/supabase/server";
import { todayInIST } from "@/lib/utils";
import type { Appointment, Doctor, Slot } from "@/types/database";

const DOCTOR_SELECT = `
  id, name, qualification, experience_years, gender, bio, expertise, languages,
  consultation_fee, consultation_type, image_url, is_active,
  specialty:specialties(id, name),
  hospital:hospitals(id, name, city)
`;

type DoctorRow = {
  id: number;
  name: string;
  qualification: string;
  experience_years: number;
  gender: string | null;
  bio: string | null;
  expertise: string[] | null;
  languages: string[] | null;
  consultation_fee: number;
  consultation_type: string[];
  image_url: string | null;
  is_active: boolean;
  specialty: { id: number; name: string } | null;
  hospital: { id: number; name: string; city: string | null } | null;
};

export function mapDoctor(row: DoctorRow): Doctor {
  return {
    id: row.id,
    name: row.name,
    specialty_id: row.specialty?.id ?? null,
    specialty_name: row.specialty?.name ?? null,
    qualification: row.qualification,
    experience_years: row.experience_years,
    gender: (row.gender as Doctor["gender"]) ?? null,
    bio: row.bio,
    expertise: row.expertise,
    languages: row.languages,
    hospital_id: row.hospital?.id ?? null,
    hospital_name: row.hospital?.name ?? null,
    hospital_city: row.hospital?.city ?? null,
    consultation_fee: Number(row.consultation_fee),
    consultation_type: row.consultation_type,
    image_url: row.image_url,
    is_active: row.is_active,
  };
}

export interface DoctorSearchParams {
  q?: string;
  specialty?: string;
  hospital?: string;
  gender?: string;
  consultation?: string;
  experience?: string;
  availability?: string;
  date?: string;
}

export async function getFilterOptions() {
  const supabase = await createClient();
  const [specialties, hospitals] = await Promise.all([
    supabase.from("specialties").select("*").order("name"),
    supabase.from("hospitals").select("*").order("name"),
  ]);
  return {
    specialties: specialties.data ?? [],
    hospitals: hospitals.data ?? [],
  };
}

/**
 * Keyword search uses Postgres ilike across name/specialty/hospital plus a
 * small synonym map so "heart" finds Cardiology and "bone" finds Orthopedics.
 */
const SYNONYMS: Record<string, string[]> = {
  heart: ["Cardiology"],
  cardiac: ["Cardiology"],
  skin: ["Dermatology"],
  hair: ["Dermatology"],
  brain: ["Neurology"],
  nerve: ["Neurology"],
  bone: ["Orthopedics"],
  joint: ["Orthopedics"],
  child: ["Pediatrics"],
  children: ["Pediatrics"],
  kids: ["Pediatrics"],
  fever: ["General Medicine"],
  general: ["General Medicine"],
  ear: ["ENT"],
  nose: ["ENT"],
  throat: ["ENT"],
  eye: ["Ophthalmology"],
  vision: ["Ophthalmology"],
  women: ["Gynecology"],
  pregnancy: ["Gynecology"],
};

function expandQuery(q: string): string[] {
  const terms = [q];
  const lower = q.toLowerCase();
  for (const [key, targets] of Object.entries(SYNONYMS)) {
    if (lower.includes(key)) terms.push(...targets);
  }
  return [...new Set(terms)];
}

export async function searchDoctors(params: DoctorSearchParams): Promise<Doctor[]> {
  const supabase = await createClient();
  let query = supabase
    .from("doctors")
    .select(DOCTOR_SELECT)
    .eq("is_active", true)
    .order("name");

  if (params.q) {
    const patterns = expandQuery(params.q).map((t) => `%${t}%`);
    // OR across name, specialty name, hospital name (embedded filter).
    query = query.or(
      `name.ilike.${patterns.join(",")},specialties.name.ilike.${patterns.join(",")},hospitals.name.ilike.${patterns.join(",")}`
    );
  }
  if (params.specialty) query = query.eq("specialties.name", params.specialty);
  if (params.hospital) query = query.eq("hospitals.name", params.hospital);
  if (params.gender && params.gender !== "any") query = query.eq("gender", params.gender);
  if (params.consultation && params.consultation !== "any") {
    query = query.contains("consultation_type", [params.consultation]);
  }
  if (params.experience && params.experience !== "any") {
    if (params.experience === "0-5") query = query.lte("experience_years", 5);
    if (params.experience === "5-10") query = query.gte("experience_years", 5).lte("experience_years", 10);
    if (params.experience === "10+") query = query.gte("experience_years", 10);
  }

  const { data, error } = await query;
  if (error) throw new Error("Could not load doctors. Please try again.");

  let doctors = (data as unknown as DoctorRow[] ?? []).map(mapDoctor);

  // Availability filter requires slot data; apply in one batched query.
  if (params.availability && params.availability !== "any") {
    const today = todayInIST();
    const dates = params.availability === "today"
      ? [today]
      : params.availability === "tomorrow"
        ? [addDays(today, 1)]
        : Array.from({ length: 7 }, (_, i) => addDays(today, i));

    const { data: slots } = await supabase
      .from("doctor_schedules")
      .select("doctor_id")
      .in("appointment_date", dates)
      .eq("status", "available");

    const withSlots = new Set((slots ?? []).map((s) => s.doctor_id));
    doctors = doctors.filter((d) => withSlots.has(d.id));
  }

  return doctors;
}

function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function getDoctorById(id: number): Promise<Doctor | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("doctors")
    .select(DOCTOR_SELECT)
    .eq("id", id)
    .single();
  return data ? mapDoctor(data as unknown as DoctorRow) : null;
}

/** Dates within the schedule window that have at least one available slot. */
export async function getAvailableDates(doctorId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("doctor_schedules")
    .select("appointment_date")
    .eq("doctor_id", doctorId)
    .eq("status", "available")
    .gte("appointment_date", todayInIST());

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.appointment_date, (counts.get(row.appointment_date) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export async function getSlotsForDate(doctorId: number, date: string): Promise<Slot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("doctor_schedules")
    .select("id, start_time, status")
    .eq("doctor_id", doctorId)
    .eq("appointment_date", date)
    .order("start_time");
  if (error) throw new Error("Could not load slots. Please try again.");
  return (data ?? []) as Slot[];
}

export async function getPatientAppointments(patientId: string): Promise<Appointment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `id, patient_id, appointment_date, appointment_time, consultation_type, reason,
       status, fee, created_at,
       doctor:doctors(name, specialties(name), hospitals(name))`
    )
    .eq("patient_id", patientId)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false });
  if (error) throw new Error("Could not load appointments.");

  return (data as unknown as {
    id: string;
    patient_id: string;
    appointment_date: string;
    appointment_time: string;
    consultation_type: string;
    reason: string | null;
    status: Appointment["status"];
    fee: number;
    created_at: string;
    doctor: { name: string; specialties: { name: string } | null; hospitals: { name: string } | null } | null;
  }[] ?? []).map((row) => ({
    id: row.id,
    patient_id: row.patient_id,
    doctor_id: 0,
    doctor_name: row.doctor?.name ?? null,
    specialty_name: row.doctor?.specialties?.name ?? null,
    hospital_name: row.doctor?.hospitals?.name ?? null,
    appointment_date: row.appointment_date,
    appointment_time: row.appointment_time.slice(0, 5),
    consultation_type: row.consultation_type,
    reason: row.reason,
    status: row.status,
    fee: Number(row.fee),
    patient_name: null,
    created_at: row.created_at,
  }));
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select(
      `id, patient_id, doctor_id, appointment_date, appointment_time, consultation_type, reason,
       status, fee, created_at,
       doctor:doctors(name, specialties(name), hospitals(name))`
    )
    .eq("id", id)
    .single();
  if (!data) return null;
  const row = data as unknown as {
    id: string;
    patient_id: string;
    doctor_id: number;
    appointment_date: string;
    appointment_time: string;
    consultation_type: string;
    reason: string | null;
    status: Appointment["status"];
    fee: number;
    created_at: string;
    doctor: { name: string; specialties: { name: string } | null; hospitals: { name: string } | null } | null;
  };
  return {
    id: row.id,
    patient_id: row.patient_id,
    doctor_id: row.doctor_id,
    doctor_name: row.doctor?.name ?? null,
    specialty_name: row.doctor?.specialties?.name ?? null,
    hospital_name: row.doctor?.hospitals?.name ?? null,
    appointment_date: row.appointment_date,
    appointment_time: row.appointment_time.slice(0, 5),
    consultation_type: row.consultation_type,
    reason: row.reason,
    status: row.status,
    fee: Number(data.fee),
    patient_name: null,
    created_at: data.created_at,
  };
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

/** Full schedule window for a doctor, for the admin schedule manager. */
export async function getAdminSchedule(doctorId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("doctor_schedules")
    .select("id, appointment_date, start_time, status")
    .eq("doctor_id", doctorId)
    .gte("appointment_date", todayInIST())
    .order("appointment_date")
    .order("start_time");
  return data ?? [];
}
