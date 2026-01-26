-- CreateEnum
CREATE TYPE "PromoCodeStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "ownerId" INTEGER;

-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN     "status" "PromoCodeStatus" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
