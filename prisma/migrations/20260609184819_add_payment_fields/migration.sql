/*
  Warnings:

  - You are about to drop the column `authority` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "authority";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authority" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "refId" TEXT;
