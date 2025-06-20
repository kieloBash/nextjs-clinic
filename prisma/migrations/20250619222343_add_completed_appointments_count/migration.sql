-- AlterTable
ALTER TABLE "users" ADD COLUMN     "completedAppointments" INTEGER DEFAULT 0;

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- CreateIndex
CREATE INDEX "users_completedAppointments_idx" ON "users"("completedAppointments");
