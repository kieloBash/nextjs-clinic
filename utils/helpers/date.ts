import { toZonedTime } from "date-fns-tz";

export function parseDate(dateString: string): Date {
    // Validate input
    if (!dateString) {
        throw new Error("Invalid input Date");
    }

    // Convert dateString from Asia/Manila to UTC-equivalent Date
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const date = new Date(dateString);
    const parts = formatter.formatToParts(date);

    const year = parts.find(p => p.type === "year")?.value;
    const month = parts.find(p => p.type === "month")?.value;
    const day = parts.find(p => p.type === "day")?.value;
    const hour = parts.find(p => p.type === "hour")?.value;
    const minute = parts.find(p => p.type === "minute")?.value;
    const second = parts.find(p => p.type === "second")?.value;

    if (!year || !month || !day || !hour || !minute || !second) {
        throw new Error("Invalid parsed parts");
    }

    // Create a string like "2025-06-12T13:30:00" from Asia/Manila's view
    const manilaDateString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

    // Parse as local date and shift to UTC by subtracting local offset
    const manilaDate = new Date(manilaDateString);
    const utcDate = new Date(manilaDate.getTime() - (manilaDate.getTimezoneOffset() * 60000));

    return utcDate;
}

import { TimeSlot } from "@prisma/client"
import { setHours, setMinutes, setSeconds, format, differenceInMinutes } from "date-fns";
import { TIME_ZONE } from "../constants";

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

export const getTodayDateTimezone = (date?: Date | string | null): Date => {
    const rawDate = date ? new Date(date) : new Date();
    const zonedDate = toZonedTime(rawDate, TIME_ZONE); // Adjust to timezone
    return zonedDate;
};

export const formatTimeToString = (dateString: string) => {
    const timePart = dateString.split("T")[1]; // "11:12:00.000Z"
    const [hour, minute] = timePart.split(":");

    return `${hour}:${minute}`;
};

// export const formatTimeToString = (date: Date) => {
//     return new Date(date).toLocaleTimeString("en-US", {
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: false, // change to true for AM/PM format
//         timeZone: "Asia/Manila", // optional: use your local time zone
//     });

//     const hours = date.getUTCHours().toString().padStart(2, "0")
//     const minutes = date.getUTCMinutes().toString().padStart(2, "0")
//     return `${hours}:${minutes}`
// }


export function getDifferenceTimeSlot(timeSlot: TimeSlot) {
    return differenceInMinutes(timeSlot.endTime, timeSlot.startTime)
}