/*
  Merge DisputeEvidence into the Dispute model as a JSON column.

  Warnings:

  - The `DisputeEvidence` table is dropped, moving evidence into the
    `evidences` JSON column on `Dispute`.
*/

-- AlterTable
ALTER TABLE "Dispute" ADD COLUMN "evidences" JSONB NOT NULL DEFAULT '[]';

-- DropTable
DROP TABLE "DisputeEvidence";