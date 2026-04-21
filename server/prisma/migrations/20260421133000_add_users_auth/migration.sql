CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "User_shopId_idx" ON "User"("shopId");
CREATE UNIQUE INDEX "User_shopId_email_key" ON "User"("shopId", "email");

ALTER TABLE "User"
ADD CONSTRAINT "User_shopId_fkey"
FOREIGN KEY ("shopId") REFERENCES "Shop"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

