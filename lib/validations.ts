import { z } from "zod";

export const patientDetailsSchema = z.object({
  full_name: z
    .string()
    .min(2, "Please enter the patient's full name")
    .max(100, "Name is too long"),
  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((v) => !isNaN(Date.parse(v)), "Enter a valid date of birth"),
  gender: z.enum(["male", "female", "other"], { message: "Select a gender" }),
  phone: z
    .string()
    .regex(/^[+]?[\d\s-]{7,15}$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
  reason: z.string().max(500, "Keep the note under 500 characters").optional(),
});

export type PatientDetails = z.infer<typeof patientDetailsSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(2, "Enter your full name").max(100),
  phone: z.string().regex(/^[+]?[\d\s-]{7,15}$/, "Enter a valid phone number"),
  date_of_birth: z
    .string()
    .refine((v) => v === "" || !isNaN(Date.parse(v)), "Enter a valid date"),
  gender: z.enum(["male", "female", "other", ""]).optional(),
});

export const doctorSchema = z.object({
  name: z.string().min(2, "Doctor name is required"),
  specialty_id: z.coerce.number().int().positive("Select a specialty"),
  hospital_id: z.coerce.number().int().positive("Select a hospital"),
  qualification: z.string().min(2, "Qualification is required"),
  experience_years: z.coerce
    .number()
    .int()
    .min(0, "Experience cannot be negative")
    .max(60, "Check the experience value"),
  gender: z.enum(["male", "female"]),
  bio: z.string().max(1000).optional(),
  expertise: z.string().optional(),
  languages: z.string().optional(),
  consultation_fee: z.coerce.number().min(0).max(100000),
  consultation_type: z
    .array(z.enum(["in-person", "video"]))
    .min(1, "Pick at least one consultation type"),
  is_active: z.boolean(),
});
