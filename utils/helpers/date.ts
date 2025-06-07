export function parseDate(dateString: string) {
    const parsedDate = Date.parse(dateString.toString());

    if (isNaN(parsedDate)) {
        throw new Error("Invalid input Date");
    }

    return new Date(parsedDate);
}

import { TimeSlot } from "@/app/generated/prisma";
import { setHours, setMinutes, setSeconds, format, differenceInMinutes } from "date-fns";

export function mergeTimeWithDate(
    timeStr: string,
    baseDate: Date = new Date(),
    returnFormatted: boolean = true,
    formatStr: string = "yyyy-MM-dd'T'HH:mm:ss"
): string | Date {
    const [hours, minutes] = timeStr.split(":").map(Number);
    let result = setSeconds(setMinutes(setHours(baseDate, hours), minutes), 0);

    return returnFormatted ? format(result, formatStr) : result;
}

export function formatTimeToString(date: Date) {
    return format(date, "HH:mm")
}

export function getDifferenceTimeSlot(timeSlot: TimeSlot) {
    return differenceInMinutes(timeSlot.endTime, timeSlot.startTime)
}