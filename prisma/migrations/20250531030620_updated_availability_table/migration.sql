/*
  Warnings:

  - You are about to drop the `weekly-availabilities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "weekly-availabilities" DROP CONSTRAINT "weekly-availabilities_doctorId_fkey";

-- DropTable
DROP TABLE "weekly-availabilities";

-- CreateTable
CREATE TABLE "availabilities" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "daysAvailable" INTEGER[],
    "opening" TEXT NOT NULL,
    "closing" TEXT NOT NULL,

    CONSTRAINT "availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "availabilities_doctorId_key" ON "availabilities"("doctorId");

-- AddForeignKey
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
