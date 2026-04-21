-- Create Shop table (tenant)
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Shop_apiKey_key" ON "Shop"("apiKey");

-- Create a legacy tenant for any existing rows (safe when DB isn't empty)
INSERT INTO "Shop" ("id", "name", "apiKey")
VALUES ('legacy-shop', 'Legacy Shop', 'legacy')
ON CONFLICT ("apiKey") DO NOTHING;

-- Drop old uniqueness on plate (was global)
DROP INDEX IF EXISTS "Car_plate_key";

-- Add shopId columns (nullable first)
ALTER TABLE "Client" ADD COLUMN "shopId" TEXT;
ALTER TABLE "Car" ADD COLUMN "shopId" TEXT;
ALTER TABLE "Service" ADD COLUMN "shopId" TEXT;

-- Backfill existing data (if any)
UPDATE "Client" SET "shopId" = 'legacy-shop' WHERE "shopId" IS NULL;
UPDATE "Car" SET "shopId" = 'legacy-shop' WHERE "shopId" IS NULL;
UPDATE "Service" SET "shopId" = 'legacy-shop' WHERE "shopId" IS NULL;

-- Enforce not-null
ALTER TABLE "Client" ALTER COLUMN "shopId" SET NOT NULL;
ALTER TABLE "Car" ALTER COLUMN "shopId" SET NOT NULL;
ALTER TABLE "Service" ALTER COLUMN "shopId" SET NOT NULL;

-- Indexes
CREATE INDEX "Client_shopId_idx" ON "Client"("shopId");
CREATE INDEX "Car_shopId_idx" ON "Car"("shopId");
CREATE INDEX "Service_shopId_idx" ON "Service"("shopId");

-- Tenant-scoped unique plate
CREATE UNIQUE INDEX "Car_shopId_plate_key" ON "Car"("shopId", "plate");

-- Foreign keys
ALTER TABLE "Client"
ADD CONSTRAINT "Client_shopId_fkey"
FOREIGN KEY ("shopId") REFERENCES "Shop"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Car"
ADD CONSTRAINT "Car_shopId_fkey"
FOREIGN KEY ("shopId") REFERENCES "Shop"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Service"
ADD CONSTRAINT "Service_shopId_fkey"
FOREIGN KEY ("shopId") REFERENCES "Shop"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

