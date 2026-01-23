-- DropIndex
DROP INDEX "BlogPost_productId_key";

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "productImageId" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "promoCode" TEXT;

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNREAD',
    "adminId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreTheme" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL DEFAULT 'My Theme',
    "primaryColor" VARCHAR(9) NOT NULL DEFAULT '#3d6b6b',
    "primaryOpacity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "primaryGradient" TEXT,
    "secondaryColor" VARCHAR(9) NOT NULL DEFAULT '#d4b8a5',
    "secondaryOpacity" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "secondaryGradient" TEXT,
    "accentColor" VARCHAR(9) NOT NULL DEFAULT '#c45a4a',
    "fontHeading" VARCHAR(100) NOT NULL DEFAULT 'Playfair Display',
    "fontBody" VARCHAR(100) NOT NULL DEFAULT 'Montserrat',
    "backgroundColor" VARCHAR(9) NOT NULL DEFAULT '#ffffff',
    "textColor" VARCHAR(9) NOT NULL DEFAULT '#111111',
    "headerConfig" JSONB,
    "heroConfig" JSONB,
    "sectionsConfig" JSONB,
    "stylePreset" VARCHAR(50) NOT NULL DEFAULT 'material',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreTheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");

-- CreateIndex
CREATE INDEX "ContactMessage_email_idx" ON "ContactMessage"("email");

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_productImageId_fkey" FOREIGN KEY ("productImageId") REFERENCES "ProductImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
