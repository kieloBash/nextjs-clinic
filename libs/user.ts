import { prisma } from "@/prisma";
import { UserFullType } from "@/types/user.type";

export async function checkUserExists({
  email,
  phone,
  id
}: {
  email?: string;
  phone?: string;
  id?: string;
}): Promise<UserFullType> {
  if (!email && !phone && !id) {
    throw new Error("At least one of email or phone or id must be provided");
  }

  return await prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
        ...(id ? [{ id }] : [])
      ],
    },
    include: { role: true }
  }) as any;
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

export async function getPatient({ patientId }: { patientId: string }) {
  return await prisma.user.findFirst({
    where: {
      id: patientId,
      role: {
        roleName: "PATIENT",
      },
    },
  });
}
