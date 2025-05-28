-- AlterTable
ALTER TABLE "Clinician" ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_locked_out" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lockout_until" TIMESTAMP(3);
