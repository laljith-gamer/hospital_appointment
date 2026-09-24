export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Specialty {
  id: number;
  name: string;
  description: string | null;
}

export interface Hospital {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
}

export interface Doctor {
  id: number;
  name: string;
  specialty_id: number | null;
  specialty_name: string | null;
  qualification: string | null;
  experience_years: number;
  gender: "male" | "female" | null;
  bio: string | null;
  expertise: string[] | null;
  languages: string[] | null;
  hospital_id: number | null;
  hospital_name: string | null;
  hospital_city: string | null;
  consultation_fee: number;
  consultation_type: string[];
  image_url: string | null;
  is_active: boolean;
}

export interface Slot {
  id: number;
  start_time: string;
  status: "available" | "booked" | "unavailable";
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  role: "patient" | "admin";
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: number;
  doctor_name: string | null;
  specialty_name: string | null;
  hospital_name: string | null;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  reason: string | null;
  status: AppointmentStatus;
  fee: number;
  patient_name: string | null;
  created_at: string;
}

export interface BookingDraft {
  doctor: Doctor;
  date: string;
  slotTime: string;
}
