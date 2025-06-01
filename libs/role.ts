import { prisma } from "@/prisma";

export async function checkValidRole({ role: roleName }: { role: string }) {
  return await prisma.role.findFirst({
    where: {
      roleName,
    },
  });
}
