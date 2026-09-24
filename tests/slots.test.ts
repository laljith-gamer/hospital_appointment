import { describe, it, expect } from "vitest";
import { formatTime, todayInIST, appointmentId } from "@/lib/utils";
import type { Slot } from "@/types/database";

describe("formatTime", () => {
  it("formats morning times", () => {
    expect(formatTime("09:30:00")).toBe("9:30 AM");
  });
  it("formats afternoon times", () => {
    expect(formatTime("13:00")).toBe("1:00 PM");
  });
  it("handles midnight and noon", () => {
    expect(formatTime("00:00")).toBe("12:00 AM");
    expect(formatTime("12:00")).toBe("12:00 PM");
  });
});

describe("todayInIST", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(todayInIST()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("appointmentId", () => {
  it("formats the display id", () => {
    expect(appointmentId("abcdef12-3456")).toBe("APT-ABCDEF12");
  });
});

describe("slot grouping", () => {
  // Mirrors the grouping logic in TimeSlotGrid to keep the pure rule tested.
  function groupSlots(slots: Slot[]) {
    const morning: Slot[] = [];
    const afternoon: Slot[] = [];
    const evening: Slot[] = [];
    for (const slot of slots) {
      const h = Number(slot.start_time.split(":")[0]);
      if (h < 12) morning.push(slot);
      else if (h < 16) afternoon.push(slot);
      else evening.push(slot);
    }
    return { morning, afternoon, evening };
  }

  const slots: Slot[] = [
    { id: 1, start_time: "09:00", status: "available" },
    { id: 2, start_time: "10:30", status: "available" },
    { id: 3, start_time: "13:00", status: "booked" },
    { id: 4, start_time: "16:00", status: "available" },
  ];

  it("groups into morning/afternoon/evening", () => {
    const g = groupSlots(slots);
    expect(g.morning.map((s) => s.start_time)).toEqual(["09:00", "10:30"]);
    expect(g.afternoon.map((s) => s.start_time)).toEqual(["13:00"]);
    expect(g.evening.map((s) => s.start_time)).toEqual(["16:00"]);
  });

  it("keeps booked slots in the grouping so the UI can disable them", () => {
    const g = groupSlots(slots);
    expect(g.afternoon[0].status).toBe("booked");
  });
});
