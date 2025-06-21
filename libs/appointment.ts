import { AppointmentStatus } from "@prisma/client"
import { prisma } from "@/prisma";

export async function createAppointmentHistory(data: { appointmentId: string, description: string, newStatus?: AppointmentStatus }) {
    return await prisma.appointmentHistory.create({
        data,
    });
}

export function getStatusLabel(status: AppointmentStatus) {
    switch (status) {
        case AppointmentStatus.PENDING: return "Pending Approval";
        case AppointmentStatus.CANCELLED: return "Cancelled";
        case AppointmentStatus.COMPLETED: return "Completed";
        case AppointmentStatus.CONFIRMED: return "Confirmed Booking";
        case AppointmentStatus.PENDING_PAYMENT: return "Pending Payment";
        case AppointmentStatus.RESCHEDULED: return "Rescheduled";
    }
}