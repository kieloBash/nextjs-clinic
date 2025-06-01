
export async function createNotification({ tx, ...data }: { userId: string, message: string, tx?: any }) {
    const db = tx ? tx : prisma;

    return await db.notification.create({
        data,
    });
}