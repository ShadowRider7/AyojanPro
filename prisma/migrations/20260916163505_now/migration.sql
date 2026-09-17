/*
  Warnings:

  - A unique constraint covering the columns `[contractId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Payment_contractId_stage_key";

-- CreateIndex
CREATE UNIQUE INDEX "Payment_contractId_key" ON "Payment"("contractId");
