-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "image" TEXT,
ADD COLUMN     "showInHome" BOOLEAN NOT NULL DEFAULT false;
