/*
  Warnings:

  - A unique constraint covering the columns `[verification_token]` on the table `Clinician` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[password_reset_token]` on the table `Clinician` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[refresh_token]` on the table `Clinician` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Clinician" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password_reset_expires" TIMESTAMP(3),
ADD COLUMN     "password_reset_token" TEXT,
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "refresh_token_expires" TIMESTAMP(3),
ADD COLUMN     "verification_token" TEXT,
ADD COLUMN     "verification_token_expires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Clinician_verification_token_key" ON "Clinician"("verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "Clinician_password_reset_token_key" ON "Clinician"("password_reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "Clinician_refresh_token_key" ON "Clinician"("refresh_token");
