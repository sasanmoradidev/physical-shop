-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_addressId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingAddressLine" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingCity" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingFullName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingPostalCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingProvince" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingTitle" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "addressId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
