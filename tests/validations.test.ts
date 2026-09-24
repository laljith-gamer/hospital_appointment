import { describe, it, expect } from "vitest";
import { patientDetailsSchema } from "@/lib/validations";

const valid = {
  full_name: "Laljith Kumar",
  date_of_birth: "1995-04-12",
  gender: "male",
  phone: "+91 98765 43210",
  email: "patient@example.com",
  reason: "General checkup",
};

describe("patientDetailsSchema", () => {
  it("accepts valid details", () => {
    expect(patientDetailsSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a missing patient name", () => {
    const result = patientDetailsSchema.safeParse({ ...valid, full_name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "full_name")).toBe(true);
    }
  });

  it("rejects an invalid email", () => {
    const result = patientDetailsSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone", () => {
    const result = patientDetailsSchema.safeParse({ ...valid, phone: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing gender", () => {
    const result = patientDetailsSchema.safeParse({ ...valid, gender: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a reason note that is too long", () => {
    const result = patientDetailsSchema.safeParse({ ...valid, reason: "x".repeat(501) });
    expect(result.success).toBe(false);
  });
});
