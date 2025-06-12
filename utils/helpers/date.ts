import { toZonedTime } from "date-fns-tz";

export function parseDate(dateString: string): Date {
    if (!dateString) {
        throw new Error("Invalid input Date");
    }

    const [datePart, timePart] = dateString.split("T");

    if (!datePart) {
        throw new Error("Invalid date format");
    }

    const [year, month, day] = datePart.split("-").map(Number);

    if ([year, month, day].some((v) => Number.isNaN(v))) {
        throw new Error("Invalid date components");
    }

    // Default time if time part is missing
    let hour = 0, minute = 0, second = 0;

    if (timePart) {
        const timeComponents = timePart.split(":").map(Number);
        [hour, minute, second] = [
            timeComponents[0] ?? 0,
            timeComponents[1] ?? 0,
            timeComponents[2] ?? 0,
        ];
    }

    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

export function getHourInTimeZone(date: Date): number {
    const formatter = new Intl.DateTimeFormat("en-PH", {
        timeZone: TIME_ZONE,
        hour: "numeric",
        hour12: false,
    });

    return Number(formatter.format(date));
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

export const formatTimeToStringPeriod = (dateString: string) => {
    const timePart = dateString.split("T")[1]; // e.g., "11:12:00.000Z"
    if (!timePart) return "";

    const [hourStr, minute] = timePart.split(":");
    let hour = parseInt(hourStr, 10);

    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // convert to 12-hour format

    return `${hour}:${minute} ${period}`;
};

export const getTimeOfDate = (dateString: string) => {

    const timePart = dateString.split("T")[1]; // "11:12:00.000Z"
    const [hour, minute] = timePart.split(":");

    return { hour: parseInt(hour), minute: parseInt(minute) };
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