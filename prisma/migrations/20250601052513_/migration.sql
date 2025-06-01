/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,date,startTime]` on the table `time-slots` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "time-slots_doctorId_date_startTime_idx";

-- CreateIndex
CREATE UNIQUE INDEX "time-slots_doctorId_date_startTime_key" ON "time-slots"("doctorId", "date", "startTime");
