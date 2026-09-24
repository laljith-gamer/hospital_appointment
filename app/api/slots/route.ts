import { NextRequest, NextResponse } from "next/server";
import { getSlotsForDate } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const doctorId = Number(request.nextUrl.searchParams.get("doctorId"));
  const date = request.nextUrl.searchParams.get("date") ?? "";
  if (!Number.isInteger(doctorId) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }
  try {
    const slots = await getSlotsForDate(doctorId, date);
    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json({ error: "Could not load slots" }, { status: 500 });
  }
}
