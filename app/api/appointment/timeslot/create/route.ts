import { TimeSlotStatus } from "@prisma/client"
import { getDoctor } from "@/libs/user";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";
import { parseDate } from "@/utils/helpers/date";
import { MISSING_PARAMETERS } from "@/utils/constants";
import { isBefore, isAfter, startOfDay, differenceInMinutes, addHours } from "date-fns";

function isDateTodayOrFuture(date: Date): boolean {
  return !isBefore(date, startOfDay(new Date()));
}

function isStartTimeBeforeEndTime(start: Date, end: Date): boolean {
  return isBefore(start, end);
}

function isMinimumDurationMet(start: Date, end: Date, minMinutes = 30): boolean {
  return differenceInMinutes(end, start) >= minMinutes;
}

function isAtLeastOneHourFromNow(dateTime: Date): boolean {
  const oneHourFromNow = addHours(new Date(), 1);
  return isAfter(dateTime, oneHourFromNow);
}

function isMaximumDurationMet(start: Date, end: Date, maxMinutes = 180): boolean {
  return differenceInMinutes(end, start) <= maxMinutes;
}

async function hasOverlappingTimeSlot(doctorId: string, start: Date, end: Date): Promise<boolean> {
  const overlappingSlots = await prisma.timeSlot.findFirst({
    where: {
      doctorId,
      OR: [
        {
          startTime: {
            lte: end,
          },
          endTime: {
            gte: start,
          },
        },
      ],
    },
  });

  return !!overlappingSlots;
}

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
  const date = parseDate(dateRaw.toString());
  const startTime = parseDate(startTimeRaw.toString());
  const endTime = parseDate(endTimeRaw.toString());

  if (startTime.getHours() < 8) {
    return new NextResponse(
      JSON.stringify({ message: "Start time must be 8:00 AM or later." }),
      { status: 400 }
    );
  }

  if (!isDateTodayOrFuture(date)) {
    return new NextResponse(
      JSON.stringify({ message: "Date must be today or in the future." }),
      { status: 400 }
    );
  }

  if (!isStartTimeBeforeEndTime(startTime, endTime)) {
    return new NextResponse(
      JSON.stringify({ message: "Start time must be before end time." }),
      { status: 400 }
    );
  }

  if (!isMinimumDurationMet(startTime, endTime)) {
    return new NextResponse(
      JSON.stringify({ message: "Time slot must be at least 30 minutes long." }),
      { status: 400 }
    );
  }

  if (!isAtLeastOneHourFromNow(startTime)) {
    return new NextResponse(
      JSON.stringify({ message: "Start time must be at least 1 hour from now." }),
      { status: 400 }
    );
  }

  if (!isMaximumDurationMet(startTime, endTime)) {
    return new NextResponse(
      JSON.stringify({ message: "Time slot must not exceed 3 hours." }),
      { status: 400 }
    );
  }

  if (await hasOverlappingTimeSlot(doctorId, startTime, endTime)) {
    return new NextResponse(
      JSON.stringify({ message: "This time slot overlaps with an existing one." }),
      { status: 400 }
    );
  }

  try {

    console.log(startTime)
    console.log(endTime)

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
  }
}
