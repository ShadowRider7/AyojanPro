/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Professional` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Professional` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Professional` table without a default value. This is not possible if the table is not empty.
  - Made the column `professionalTitle` on table `Professional` required. This step will fail if there are existing NULL values in that column.
  - Made the column `experienceYears` on table `Professional` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Professional" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "professionalTitle" SET NOT NULL,
ALTER COLUMN "experienceYears" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "needPasswordChange" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Professional_email_key" ON "Professional"("email");
