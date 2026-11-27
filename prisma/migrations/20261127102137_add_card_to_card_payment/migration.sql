-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'AWAITING_VERIFICATION';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "receiptImage" TEXT,
ADD COLUMN     "receiptNote" TEXT,
ADD COLUMN     "receiptSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "receiptTrackingCode" TEXT;

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "cardHolder" TEXT,
ADD COLUMN     "cardNumber" TEXT;
