import { prisma } from "@/prisma";

export async function checkUserExists({
  email,
  phone,
}: {
  email?: string;
  phone?: string;
}) {
  if (!email && !phone) {
    throw new Error("At least one of email or phone must be provided");
  }

  return await prisma.user.findFirst({
    where: {
      OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
    },
  });
}

export async function getDoctor({ doctorId }: { doctorId: string }) {
  return await prisma.user.findFirst({
    where: {
      id: doctorId,
      role: {
        roleName: "DOCTOR",
      },
    },
  });
}
