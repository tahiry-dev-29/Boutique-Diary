-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photo" TEXT;

-- CreateTable
CREATE TABLE "ReviewReply" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "adminId" INTEGER,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReaction" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "userId" INTEGER,
    "adminId" INTEGER,

    CONSTRAINT "ReviewReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewReply_reviewId_idx" ON "ReviewReply"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewReaction_reviewId_userId_adminId_type_key" ON "ReviewReaction"("reviewId", "userId", "adminId", "type");

-- AddForeignKey
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReaction" ADD CONSTRAINT "ReviewReaction_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReaction" ADD CONSTRAINT "ReviewReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReaction" ADD CONSTRAINT "ReviewReaction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
