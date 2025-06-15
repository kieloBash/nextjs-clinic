import { AppointmentStatus } from "@prisma/client";

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

export const BOOKING_WAITING_PAYMENT_NOTIFICATION_DOCTOR = "A notification prompting the patient to pay their bill has been sent!";
export const BOOKING_WAITING_PAYMENT_NOTIFICATION_PATIENT = "You have an awaiting payment!";

export const PROFILE_UPDATE = "You updated your profile!";
export const PASSWORD_UPDATE = "You updated your password!";

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

export const NEW_BOOKED_APPOINTMENT_WAITING_FOR_PAYMENT_HISTORY = (amount: number, patientName: string, doctorName: string) => {
    return `Waiting payment amount of ${amount} for ${patientName} with doctor ${doctorName}`;
};

export const NEW_BOOKED_APPOINTMENT_HISTORY = (patientName: string, doctorName: string) => {
    return `Booked appointment for ${patientName} to doctor ${doctorName}`
}

export const QUEUE_ADDED_NOTIFICATION_PATIENT = (lineNumber: number) =>
    `You have been added to the queue. Your current position is #${lineNumber}. Please wait for your turn.`;

export const QUEUE_ADDED_NOTIFICATION_DOCTOR = (patientName: string, lineNumber: number) =>
    `Patient ${patientName} has been added to the queue at position #${lineNumber}.`;

export const MISSING_PARAMETERS = "Missing parameters!";
export const NO_SESSION = "Uh oh, you are not currently logged in!";
export const HAS_SESSION = "User is logged in!";
export const CREATED_PROMPT_SUCCESS = "Created Successfully!";
export const WELCOME_PROMPT = "Welcome back, great to see you again!";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ? process.env.NEXT_PUBLIC_APP_NAME : "ClinicApp"
export const TIME_ZONE = process.env.NEXT_PUBLIC_TIME_ZONE ? process.env.NEXT_PUBLIC_TIME_ZONE : "Asia/Manila"

export const FETCH_INTERVAL = 60000 * 10;

export const FORMAT = "yyyy-MM-dd";

export const getAppointmentStatusDisplay = (status: AppointmentStatus) => {
    const CLASSNAME = {
        COMPLETED: "bg-blue-500 hover:bg-blue-600 text-white border-blue-600",
        PENDING: "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600",
        CANCELLED: "bg-red-500 hover:bg-red-600 text-white border-red-600",
        PENDING_PAYMENT: "bg-green-500 hover:bg-green-600 text-white border-green-600",
        CONFIRMED: "bg-violet-500 hover:bg-violet-600 text-white border-violet-600",
        RESCHEDULED: "bg-orange-500 hover:bg-orange-600 text-white border-orange-600",
    }

    const LABEL = {
        COMPLETED: "Completed",
        PENDING: "Pending Approval",
        CANCELLED: "Cancelled",
        PENDING_PAYMENT: "Pending Payment",
        CONFIRMED: "Confirmed",
        RESCHEDULED: "Rescheduled",
    }

    const className = CLASSNAME[status];
    const label = LABEL[status];

    return { className, label }
}