import { Appointment, Role, TimeSlot, User } from "@/app/generated/prisma";

export type UserFullType = User & {
    role: Role
}

export type FullAppointmentType = Appointment & {
    timeSlot: TimeSlot
    patient: User
    doctor: User
}