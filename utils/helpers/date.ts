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
        const timeComponents = timePart.replace("Z", "").split(":").map(Number);
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

function getUtcTimeDateMerged({ isoDateString, parsedUtcDate }: { isoDateString: string, parsedUtcDate: Date }) {
    const utc = nowUTC(new Date(isoDateString));
    const parsedUtc: Date = parseDate(utc.toISOString());
    const splitUtc = splitHourMinuteFromISO(parsedUtc.toISOString());
    const utcTime = `${splitUtc.hour}:${splitUtc.minute}`
    const finalParsed = parseDate(mergeTimeWithDate(utcTime, parsedUtcDate) as string);

    return finalParsed;
}

export function timeSlotFormatterUTC(given: { isoDate: string, isoStart: string, isoEnd: string }) {
    // Date of the timeslot
    console.log("START timeSlotFormatterUTC")
    console.log("given: ", given)
    const utcDate = nowUTC(new Date(given.isoDate));
    const parsedUtcDate: Date = parseDate(utcDate.toISOString());

    console.log("parsedUtcDate", parsedUtcDate)

    const finalParsedStart = getUtcTimeDateMerged({ isoDateString: given.isoStart, parsedUtcDate })
    console.log("finalParsedStart", finalParsedStart)

    const finalParsedEnd = getUtcTimeDateMerged({ isoDateString: given.isoEnd, parsedUtcDate })
    console.log("finalParsedEnd", finalParsedEnd)

    const result = { date: parsedUtcDate, start: finalParsedStart, end: finalParsedEnd }

    console.log("END timeSlotFormatterUTC")
    return result;
}

export function nowUTC(givenDate?: Date): Date {
    const now = givenDate ? givenDate : new Date();
    return new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds()
    ));
}

export function formatDateBaseOnTimeZone_String(
    input: Date | string,
    options?: Intl.DateTimeFormatOptions
): string {
    const date = typeof input === "string" ? new Date(input) : input;

    const formatter = new Intl.DateTimeFormat("en-PH", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        ...options,
    });

    return formatter.format(date);
}

export function formatDateBaseOnTimeZone_Date(input: Date | string) {
    const date = typeof input === "string" ? new Date(input) : input;

    // Get the timestamp adjusted to Manila time
    const utc = date.getTime();
    const manilaOffsetMs = 8 * 60 * 60 * 1000; // UTC+8

    const resultDate = new Date(utc + manilaOffsetMs);
    const isoString = resultDate.toISOString();
    const { hour, minute } = splitHourMinuteFromISO(isoString);
    const time = `${hour}:${minute}`
    const displayTime = formatTo12HourTime(time);

    return { resultDate, hour, minute, time, displayTime };
}

export function splitHourMinuteFromISO(isoString: string): { hour: number; minute: number } {
    const timePart = isoString.split("T")[1]; // "12:13:05.000Z"
    const [hourStr, minuteStr] = timePart.split(":"); // ["12", "13", "05.000Z"]

    return {
        hour: parseInt(hourStr, 10),
        minute: parseInt(minuteStr, 10),
    };
}

export function formatTo12HourTime(time: string): string {
    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr.padStart(2, "0");

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // Convert 0 -> 12, 13 -> 1, etc.

    return `${hour}:${minute} ${ampm}`;
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

export const getTimeOfDateString = (dateString: string) => {

    const timePart = dateString.split("T")[1]; // "11:12:00.000Z"
    const [hour, minute] = timePart.split(":");

    return { hour: (hour), minute: (minute) };
};

export function replaceTimeInDate(dateStr: string, timeStr: string): string {
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);

    date.setUTCHours(hours, minutes, 0, 0); // Set time in UTC
    return date.toISOString();
}



export function getDifferenceTimeSlot(timeSlot: TimeSlot) {
    return differenceInMinutes(timeSlot.endTime, timeSlot.startTime)
}