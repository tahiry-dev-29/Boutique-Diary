-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPromotion" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
