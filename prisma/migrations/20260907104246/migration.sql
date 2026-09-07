/*
  Warnings:

  - You are about to drop the column `proposalId` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `eventServiceRequirementId` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `professionalServiceId` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `proposedAmount` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `proposedEndAt` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `proposedStartAt` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `respondedAt` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Proposal` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[proposalItemId]` on the table `Contract` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `proposalItemId` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_eventServiceRequirementId_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_professionalServiceId_fkey";

-- DropIndex
DROP INDEX "Contract_proposalId_key";

-- DropIndex
DROP INDEX "Proposal_eventServiceRequirementId_idx";

-- DropIndex
DROP INDEX "Proposal_professionalServiceId_idx";

-- DropIndex
DROP INDEX "Proposal_proposedStartAt_proposedEndAt_idx";

-- DropIndex
DROP INDEX "Proposal_status_idx";

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "proposalId",
ADD COLUMN     "proposalItemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "currency",
DROP COLUMN "eventServiceRequirementId",
DROP COLUMN "professionalServiceId",
DROP COLUMN "proposedAmount",
DROP COLUMN "proposedEndAt",
DROP COLUMN "proposedStartAt",
DROP COLUMN "respondedAt",
DROP COLUMN "status",
ADD COLUMN     "eventId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ProposalItem" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "eventServiceRequirementId" TEXT NOT NULL,
    "professionalServiceId" TEXT NOT NULL,
    "proposedAmount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'BDT',
    "proposedStartAt" TIMESTAMP(3) NOT NULL,
    "proposedEndAt" TIMESTAMP(3) NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProposalItem_eventServiceRequirementId_idx" ON "ProposalItem"("eventServiceRequirementId");

-- CreateIndex
CREATE INDEX "ProposalItem_professionalServiceId_idx" ON "ProposalItem"("professionalServiceId");

-- CreateIndex
CREATE INDEX "ProposalItem_status_idx" ON "ProposalItem"("status");

-- CreateIndex
CREATE INDEX "ProposalItem_proposedStartAt_proposedEndAt_idx" ON "ProposalItem"("proposedStartAt", "proposedEndAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalItem_proposalId_eventServiceRequirementId_key" ON "ProposalItem"("proposalId", "eventServiceRequirementId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_proposalItemId_key" ON "Contract"("proposalItemId");

-- CreateIndex
CREATE INDEX "Proposal_eventId_idx" ON "Proposal"("eventId");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_proposalItemId_fkey" FOREIGN KEY ("proposalItemId") REFERENCES "ProposalItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalItem" ADD CONSTRAINT "ProposalItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalItem" ADD CONSTRAINT "ProposalItem_eventServiceRequirementId_fkey" FOREIGN KEY ("eventServiceRequirementId") REFERENCES "EventServiceRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalItem" ADD CONSTRAINT "ProposalItem_professionalServiceId_fkey" FOREIGN KEY ("professionalServiceId") REFERENCES "ProfessionalService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
