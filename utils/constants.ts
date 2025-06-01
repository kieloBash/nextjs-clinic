export const PENDING_BOOKING_NOTIFICATION_PATIENT = "Your booked has been notified to the doctor, please wait for your appointment to be confirmed";
export const PENDING_BOOKING_NOTIFICATION_DOCTOR = "You have a new booking! Please confirm!";

export const NEW_BOOKED_TIMESLOT_CLOSED = "Sorry, timeslot has already been booked/closed. Please book another timeslot. Thank you!";

export const MISSING_PARAMETERS = "Missing parameters!";

export const NEW_BOOKED_APPOINTMENT_HISTORY = (patientName: string, doctorName: string) => {
    return `Booked appointment for ${patientName} to doctor ${doctorName}`
}