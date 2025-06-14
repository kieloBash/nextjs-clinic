import { TimeSlotStatus } from "@prisma/client"
import { getDoctor } from "@/libs/user";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";
import { parseDate } from "@/utils/helpers/date";
import { MISSING_PARAMETERS } from "@/utils/constants";
import { timeslotValid } from "@/utils/helpers/timeslot";

export async function POST(request: Request) {
  const formData = await request.formData();

  const dateRaw = formData.get("date");
  const startTimeRaw = formData.get("startTime");
  const endTimeRaw = formData.get("endTime");
  const doctorIdRaw = formData.get("doctorId");
  const statusRaw = formData.get("status");

  if (!dateRaw || !startTimeRaw || !endTimeRaw || !doctorIdRaw || !statusRaw) {
    return new NextResponse(JSON.stringify({ message: MISSING_PARAMETERS }), {
      status: 400,
    });
  }

  if (!Object.keys(TimeSlotStatus).includes(statusRaw.toString())) {
    return new NextResponse(JSON.stringify({ message: "Invalid status" }), {
      status: 400,
    });
  }

  const doctorId = doctorIdRaw.toString();

  const existingDoctor = await getDoctor({ doctorId });

  if (!existingDoctor) {
    return new NextResponse(JSON.stringify({ message: "No doctor found!" }), {
      status: 400,
    });
  }

  const status = statusRaw.toString() as TimeSlotStatus;

  console.log("RAW DETAILS -- DATE:", dateRaw.toString(), " START:", startTimeRaw.toString(), " END:", endTimeRaw.toString())
  const date = parseDate(dateRaw.toString());
  const startTime = parseDate(startTimeRaw.toString());
  const endTime = parseDate(endTimeRaw.toString());
  console.log("PARSED DETAILS -- DATE:", date, " START:", startTime, " END:", endTime)

  const checker = await timeslotValid(date, startTimeRaw.toString(), endTimeRaw.toString(), doctorId)
  if (checker) {
    return checker;
  }

  try {
    const newTimeSlot = await prisma.timeSlot.create({
      data: {
        doctorId: existingDoctor.id,
        status,
        date,
        startTime,
        endTime,
      },
    });

    console.log(newTimeSlot)


    return new NextResponse(
      JSON.stringify({ message: "Created time slot", payload: newTimeSlot }),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return new NextResponse(
        JSON.stringify({
          message: "A time slot already exists at that time for this doctor.",
        }),
        { status: 409 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
