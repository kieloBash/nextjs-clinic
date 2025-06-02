export const PENDING_BOOKING_NOTIFICATION_PATIENT = "Your booked has been notified to the doctor, please wait for your appointment to be confirmed";
export const PENDING_BOOKING_NOTIFICATION_DOCTOR = "You have a new booking! Please confirm!";

export const NEW_BOOKED_TIMESLOT_CLOSED = "Sorry, timeslot has already been booked/closed. Please book another timeslot. Thank you!";

export const BOOKING_CONFIRMED_NOTIFICATION_PATIENT = "Your appointment has been confirmed by the doctor.";
export const BOOKING_CONFIRMED_NOTIFICATION_DOCTOR = "You have confirmed the appointment.";

export const BOOKING_COMPLETED_NOTIFICATION_PATIENT = "Your appointment has been marked as completed.";
export const BOOKING_COMPLETED_NOTIFICATION_DOCTOR = "You have marked the appointment as completed.";

export const BOOKING_CANCELLED_NOTIFICATION_PATIENT = "Your appointment has been cancelled.";
export const BOOKING_CANCELLED_NOTIFICATION_DOCTOR = "You have cancelled the appointment.";

export const BOOKING_RESCHEDULED_NOTIFICATION_PATIENT = "Your appointment has been rescheduled. Please check the updated time.";
export const BOOKING_RESCHEDULED_NOTIFICATION_DOCTOR = "You have successfully rescheduled the appointment.";

export const BOOKING_PATIENT_ADDED_FROM_QUEUE = "Patient added from the queue!";

export const NEW_BOOKED_APPOINTMENT_CONFIRMED_HISTORY = (patientName: string, doctorName: string) => {
    return `Confirmed appointment for ${patientName} with doctor ${doctorName}`;
};

export const NEW_BOOKED_APPOINTMENT_COMPLETED_HISTORY = (patientName: string, doctorName: string) => {
    return `Completed appointment for ${patientName} with doctor ${doctorName}`;
};

export const NEW_BOOKED_APPOINTMENT_CANCELLED_HISTORY = (patientName: string, doctorName: string) => {
    return `Cancelled appointment for ${patientName} with doctor ${doctorName}`;
};

export const NEW_BOOKED_APPOINTMENT_RESCHEDULED_HISTORY = (patientName: string, doctorName: string) => {
    return `Rescheduled appointment for ${patientName} with doctor ${doctorName}`;
};

export const NEW_BOOKED_APPOINTMENT_HISTORY = (patientName: string, doctorName: string) => {
    return `Booked appointment for ${patientName} to doctor ${doctorName}`
}

export const QUEUE_ADDED_NOTIFICATION_PATIENT = (lineNumber: number) =>
    `You have been added to the queue. Your current position is #${lineNumber}. Please wait for your turn.`;

export const QUEUE_ADDED_NOTIFICATION_DOCTOR = (patientName: string, lineNumber: number) =>
    `Patient ${patientName} has been added to the queue at position #${lineNumber}.`;

export const MISSING_PARAMETERS = "Missing parameters!";
