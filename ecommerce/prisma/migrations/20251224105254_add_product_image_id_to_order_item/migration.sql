-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productImageId" INTEGER;

-- CreateIndex
CREATE INDEX "OrderItem_productImageId_idx" ON "OrderItem"("productImageId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productImageId_fkey" FOREIGN KEY ("productImageId") REFERENCES "ProductImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
