import { AppointmentStatus } from "@prisma/client"
import { prisma } from "@/prisma";

export async function createAppointmentHistory(data: { appointmentId: string, description: string, newStatus?: AppointmentStatus }) {
    return await prisma.appointmentHistory.create({
        data,
    });
}