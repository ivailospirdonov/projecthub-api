/*
  Warnings:

  - You are about to drop the column `organizationId` on the `AuditLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_organizationId_fkey";

-- DropIndex
DROP INDEX "AuditLog_organizationId_idx";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "organizationId";
