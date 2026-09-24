"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateSelector } from "./DateSelector";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { BookingSummary } from "./BookingSummary";
import { PatientDetailsForm } from "./PatientDetailsForm";
import { ReviewStep } from "./ReviewStep";
import { BookingStepper } from "./BookingStepper";
import { bookAppointment, type ActionResult } from "@/lib/actions/appointments";
import type { Doctor } from "@/types/database";

export interface DateOption {
  date: string;
  count: number;
}

const STEPS = ["Doctor", "Schedule", "Details", "Confirm"] as const;

export function BookingWizard({
  doctor,
  dates,
  defaultEmail,
  defaultName,
}: {
  doctor: Doctor;
  dates: DateOption[];
  defaultEmail: string;
  defaultName: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<string | null>(null);
  const [slotTime, setSlotTime] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState("in-person");
  const [details, setDetails] = useState<Record<string, string> | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(detailsForm: Record<string, string>) {
    if (!date || !slotTime) return;
    setSubmitting(true);
    setConflict(null);
    const result: ActionResult = await bookAppointment({
      doctorId: doctor.id,
      date,
      slotTime,
      consultationType,
      details: {
        full_name: detailsForm.full_name,
        date_of_birth: detailsForm.date_of_birth,
        gender: detailsForm.gender,
        phone: detailsForm.phone,
        email: detailsForm.email,
        reason: detailsForm.reason,
      },
    });
    setSubmitting(false);
    if (result.ok && result.appointmentId) {
      router.push(`/appointments/success?id=${result.appointmentId}`);
    } else {
      setConflict(result.error ?? "Booking failed. Please try again.");
    }
  }

  const stepContent = {
    1: date || slotTime ? (
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <DateSelector dates={dates} selected={date} onSelect={(d) => { setDate(d); setSlotTime(null); }} />
          {date && (
            <div className="mt-6">
              <TimeSlotGrid doctorId={doctor.id} date={date} selected={slotTime} onSelect={setSlotTime} />
            </div>
          )}
        </div>
        <BookingSummary
          doctor={doctor}
          date={date}
          slotTime={slotTime}
          consultationType={consultationType}
          onConsultationChange={setConsultationType}
          ctaLabel="Continue"
          onCta={() => slotTime && setStep(2)}
          ctaDisabled={!slotTime}
        />
      </div>
    ) : (
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <DateSelector dates={dates} selected={null} onSelect={(d) => { setDate(d); setSlotTime(null); }} />
        </div>
        <BookingSummary
          doctor={doctor}
          date={null}
          slotTime={null}
          consultationType={consultationType}
          onConsultationChange={setConsultationType}
          ctaLabel="Continue"
          onCta={() => {}}
          ctaDisabled
        />
      </div>
    ),
    2: (
      <PatientDetailsForm
        defaultEmail={defaultEmail}
        defaultName={defaultName}
        onBack={() => setStep(1)}
        onContinue={(form) => {
          setDetails(form);
          setStep(3);
        }}
      />
    ),
    3: details ? (
      <ReviewStep
        doctor={doctor}
        date={date!}
        slotTime={slotTime!}
        consultationType={consultationType}
        details={details}
        onBack={() => setStep(2)}
        submitting={submitting}
        conflict={conflict}
        onConfirm={() => void submit(details)}
      />
    ) : null,
  } as const;

  return (
    <div>
      <BookingStepper steps={[...STEPS]} current={step + 1} />
      <div key={step} className="animate-fade-in-up">{stepContent[step as 1 | 2 | 3]}</div>
    </div>
  );
}