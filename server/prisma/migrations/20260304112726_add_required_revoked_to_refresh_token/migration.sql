/*
  Warnings:

  - Made the column `revoked` on table `RefreshToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "revoked" SET NOT NULL;
