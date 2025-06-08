import { Appointment, Queue, Role, TimeSlot, User } from "@prisma/client"

export type UserFullType = User & {
    role: Role
}

export type FullAppointmentType = Appointment & {
    timeSlot: TimeSlot
    patient: User
    doctor: User
}

export type FullQueueType = Queue & {
    patient: UserFullType
    doctor: UserFullType
    appointment: Appointment
}