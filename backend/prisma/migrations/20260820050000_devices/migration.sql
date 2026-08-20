CREATE TYPE "device_type" AS ENUM ('ESP32', 'ESP8266', 'OTHER');
CREATE TYPE "device_status" AS ENUM ('ACTIVE', 'MAINTENANCE', 'DISABLED');

CREATE TABLE "devices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hardware_uid" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "device_type" "device_type" NOT NULL,
    "incubator_id" UUID NOT NULL,
    "status" "device_status" NOT NULL DEFAULT 'ACTIVE',
    "firmware_version" VARCHAR(50),
    "last_seen_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "devices_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "devices_incubator_id_fkey" FOREIGN KEY ("incubator_id") REFERENCES "incubators"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "devices_hardware_uid_key" ON "devices"("hardware_uid");
CREATE UNIQUE INDEX "devices_code_key" ON "devices"("code");
CREATE INDEX "devices_incubator_id_idx" ON "devices"("incubator_id");
CREATE INDEX "devices_status_idx" ON "devices"("status");
CREATE INDEX "devices_created_at_idx" ON "devices"("created_at" DESC);
