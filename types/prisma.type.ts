import { Appointment, Invoice, Queue, Role, TimeSlot, User } from "@prisma/client"

export type UserFullType = User & {
    role: Role
}

export type FullDoctorSearchType = User & {
    role: Role
    completedAppointments: number
    doctorTimeSlots: FullTimeSlotType[]
}

export type FullTimeSlotType = TimeSlot & {
    appointment?: Appointment
}

export type FullAppointmentType = Appointment & {
    timeSlot: TimeSlot
    patient: User
    doctor: User
    invoice?: Invoice
}

export type FullQueueType = Queue & {
    patient: UserFullType
    doctor: UserFullType
    appointment?: Appointment
}


export type FullInvoiceType = Invoice & {
    patient: UserFullType
    creator: UserFullType
    appointment: Appointment
}