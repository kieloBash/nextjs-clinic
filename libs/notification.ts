import { prisma } from "@/prisma";
import { sendEmail } from "@/utils/email/sendEmail";

interface CreateNotificationParams {
    userId: string;
    message: string;
    tx?: any;
    email?: {
        to: string;
        subject: string;
        htmlContent: string;
    };
}

// export async function createNotification({ tx, ...data }: { userId: string, message: string, tx?: any }) {
//     const db = tx ? tx : prisma;

//     return await db.notification.create({
//         data,
//     });
// }


export async function createNotification({ tx, email, ...data }: CreateNotificationParams) {
    const db = tx ?? prisma;
    
    const notification = await db.notification.create({
        data,
    });
    
    if (email) {
        try {
            await sendEmail(email.to, email.subject, email.htmlContent);
        } catch (error) {
            console.error("Failed to send email:", error); // For errors
            }
        }

        return notification;
}
