/*
  Warnings:

  - The values [LOCAL] on the enum `AuthProvider` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `displayName` on the `creators` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `creators` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyName` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `creators` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `creators` table without a default value. This is not possible if the table is not empty.
  - Made the column `experience` on table `creators` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `creatorId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthProvider_new" AS ENUM ('CREDENTIAL', 'GOOGLE');
ALTER TABLE "public"."users" ALTER COLUMN "authProvider" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "authProvider" TYPE "AuthProvider_new" USING ("authProvider"::text::"AuthProvider_new");
ALTER TYPE "AuthProvider" RENAME TO "AuthProvider_old";
ALTER TYPE "AuthProvider_new" RENAME TO "AuthProvider";
DROP TYPE "public"."AuthProvider_old";
ALTER TABLE "users" ALTER COLUMN "authProvider" SET DEFAULT 'CREDENTIAL';
COMMIT;

-- DropIndex
DROP INDEX "creators_isAvailable_idx";

-- DropIndex
DROP INDEX "payments_milestoneId_key";

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "companyName" VARCHAR(255) NOT NULL,
ADD COLUMN     "completedProjects" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "industry" VARCHAR(100),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" VARCHAR(30),
ADD COLUMN     "totalProjects" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "creators" DROP COLUMN "displayName",
ADD COLUMN     "behanceUrl" TEXT,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "dribbbleUrl" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "experience" SET NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "authProvider" SET DEFAULT 'CREDENTIAL';

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "creators_email_key" ON "creators"("email");

-- CreateIndex
CREATE INDEX "creators_completedProjects_idx" ON "creators"("completedProjects");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "creators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
