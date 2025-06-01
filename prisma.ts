import { PrismaClient } from "./app/generated/prisma";

declare global {
  // Prevent multiple instances in dev
  var prisma: PrismaClient;
}
const globalForPrisma = globalThis as typeof globalThis & {
  prisma: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
