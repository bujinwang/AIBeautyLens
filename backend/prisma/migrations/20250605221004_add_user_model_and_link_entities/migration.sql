/*
  Warnings:

  - You are about to drop the column `email` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `failed_login_attempts` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `hashed_password` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `is_locked_out` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `lockout_until` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `password_reset_expires` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `password_reset_token` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token_expires` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `roles` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `salt` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `verification_token` on the `Clinician` table. All the data in the column will be lost.
  - You are about to drop the column `verification_token_expires` on the `Clinician` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Clinician` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `Clinician` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Clinician_email_key";

-- DropIndex
DROP INDEX "Clinician_password_reset_token_key";

-- DropIndex
DROP INDEX "Clinician_refresh_token_key";

-- DropIndex
DROP INDEX "Clinician_verification_token_key";

-- AlterTable
ALTER TABLE "Clinician" DROP COLUMN "email",
DROP COLUMN "email_verified",
DROP COLUMN "failed_login_attempts",
DROP COLUMN "hashed_password",
DROP COLUMN "is_locked_out",
DROP COLUMN "lockout_until",
DROP COLUMN "password_reset_expires",
DROP COLUMN "password_reset_token",
DROP COLUMN "refresh_token",
DROP COLUMN "refresh_token_expires",
DROP COLUMN "roles",
DROP COLUMN "salt",
DROP COLUMN "verification_token",
DROP COLUMN "verification_token_expires",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "user_id" TEXT;

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "verification_token_expires" TIMESTAMP(3),
    "password_reset_token" TEXT,
    "password_reset_expires" TIMESTAMP(3),
    "refresh_token" TEXT,
    "refresh_token_expires" TIMESTAMP(3),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "lockout_until" TIMESTAMP(3),
    "is_locked_out" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_verification_token_key" ON "User"("verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "User_password_reset_token_key" ON "User"("password_reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "User_refresh_token_key" ON "User"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "Clinician_user_id_key" ON "Clinician"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_user_id_key" ON "Patient"("user_id");

-- AddForeignKey
ALTER TABLE "Clinician" ADD CONSTRAINT "Clinician_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
