/*
  Warnings:

  - You are about to drop the column `createdAt` on the `queues` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[patientId,doctorId]` on the table `queues` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `doctorId` to the `queues` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `queues` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `queues` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'APPROVED');

-- DropForeignKey
ALTER TABLE "queues" DROP CONSTRAINT "queues_appointmentId_fkey";

-- AlterTable
ALTER TABLE "queues" DROP COLUMN "createdAt",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "doctorId" TEXT NOT NULL,
ADD COLUMN     "patientId" TEXT NOT NULL,
ALTER COLUMN "appointmentId" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "QueueStatus" NOT NULL;

-- CreateIndex
CREATE INDEX "queues_doctorId_date_position_idx" ON "queues"("doctorId", "date", "position");

-- CreateIndex
CREATE INDEX "queues_status_idx" ON "queues"("status");

-- CreateIndex
CREATE UNIQUE INDEX "queues_patientId_doctorId_key" ON "queues"("patientId", "doctorId");

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
