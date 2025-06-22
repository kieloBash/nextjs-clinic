import { isBefore, isAfter, startOfDay, differenceInMinutes, addHours } from "date-fns";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";
import { formatDateBaseOnTimeZone_Date, getTimeOfDate, parseDate } from "./date";

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
    const overlappingSlot = await prisma.timeSlot.findFirst({
        where: {
            doctorId,
            startTime: {
                lt: end, // must start before the new one ends
            },
            endTime: {
                gt: start, // must end after the new one starts
            },
        },
    });

    console.log({ overlappingSlot });

    return !!overlappingSlot;
}



export async function timeslotValid(date: Date, startTimeRaw: string, endTimeRaw: string, doctorId: string) {

    console.log("START timeslotValid")

    const { resultDate: startTime } = formatDateBaseOnTimeZone_Date(startTimeRaw)
    const { resultDate: endTime } = formatDateBaseOnTimeZone_Date(endTimeRaw)
    const startTimeHours = getTimeOfDate(startTime.toISOString());
    console.log("CHECKING VALUES: ", { startTime, endTime, startTimeHours })

    if (startTimeHours.hour < 8) {
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

    // if (!isAtLeastOneHourFromNow(startTime)) {
    //     return new NextResponse(
    //         JSON.stringify({ message: "Start time must be at least 1 hour from now." }),
    //         { status: 400 }
    //     );
    // }

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

    return null;
}