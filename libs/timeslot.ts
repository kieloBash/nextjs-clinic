import { prisma } from "@/prisma";

export async function getTimeSlot({ timeSlotId }: { timeSlotId: string }) {
    return await prisma.timeSlot.findFirst({
        where: {
            id: timeSlotId,
        },
    });
}