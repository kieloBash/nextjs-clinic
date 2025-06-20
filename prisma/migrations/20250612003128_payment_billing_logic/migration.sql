/*
  Warnings:

  - A unique constraint covering the columns `[appointmentId]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appointmentId` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'PENDING_PAYMENT';

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_patientId_fkey";

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "appointmentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "invoices_appointmentId_key" ON "invoices"("appointmentId");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
