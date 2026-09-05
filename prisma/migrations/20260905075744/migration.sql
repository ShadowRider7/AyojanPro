/*
  Warnings:

  - You are about to drop the column `email` on the `Professional` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Professional` table. All the data in the column will be lost.
  - Added the required column `type` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Professional_email_idx";

-- AlterTable
ALTER TABLE "Professional" DROP COLUMN "email",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "type" "NotificationType" NOT NULL;

-- DropEnum
DROP TYPE "AvailabilityType";

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "externalUrl" TEXT[],
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deliverable_contractId_key" ON "Deliverable"("contractId");

-- CreateIndex
CREATE INDEX "Deliverable_contractId_idx" ON "Deliverable"("contractId");

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
