/*
  Warnings:

  - You are about to drop the column `changed_at` on the `appointment-histories` table. All the data in the column will be lost.
  - Made the column `description` on table `appointment-histories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "appointment-histories" DROP COLUMN "changed_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "newStatus" DROP NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
