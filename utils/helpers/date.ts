export function parseDate(dateString: string) {
    const parsedDate = Date.parse(dateString.toString());

    if (isNaN(parsedDate)) {
        throw new Error("Invalid input Date");
    }

    return new Date(parsedDate);
}