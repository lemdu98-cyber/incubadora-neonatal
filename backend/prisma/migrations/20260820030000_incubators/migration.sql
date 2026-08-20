CREATE TYPE "incubator_status" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE');

CREATE TABLE "incubators" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "location" VARCHAR(150) NOT NULL,
    "serial_number" VARCHAR(100),
    "manufacturer" VARCHAR(100),
    "model" VARCHAR(100),
    "status" "incubator_status" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incubators_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "incubators_code_key" ON "incubators"("code");
CREATE UNIQUE INDEX "incubators_serial_number_key" ON "incubators"("serial_number");
CREATE INDEX "incubators_status_idx" ON "incubators"("status");
CREATE INDEX "incubators_created_at_idx" ON "incubators"("created_at" DESC);
