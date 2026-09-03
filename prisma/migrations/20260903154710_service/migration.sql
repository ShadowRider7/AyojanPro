/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `creator_services` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `creator_services` table. All the data in the column will be lost.
  - Made the column `publicId` on table `portfolio_items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "creator_services_isDeleted_idx";

-- AlterTable
ALTER TABLE "creator_services" DROP COLUMN "deletedAt",
DROP COLUMN "isDeleted";

-- AlterTable
ALTER TABLE "portfolio_items" ALTER COLUMN "publicId" SET NOT NULL;
