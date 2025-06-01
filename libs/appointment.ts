import { AppointmentStatus } from "@/app/generated/prisma";

export async function createAppointmentHistory(data: { appointmentId: string, description: string, newStatus?: AppointmentStatus }) {
    return await prisma.appointmentHistory.create({
        data,
    });
}