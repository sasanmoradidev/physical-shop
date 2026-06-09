/*
  Warnings:

  - You are about to drop the column `authority` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `refId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "authority" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "refId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authority",
DROP COLUMN "paidAt",
DROP COLUMN "refId";
