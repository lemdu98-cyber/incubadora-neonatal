CREATE TYPE "sensor_type" AS ENUM ('DHT11', 'DHT22', 'MAX30100', 'MAX30205', 'OTHER');
CREATE TYPE "sensor_status" AS ENUM ('ACTIVE', 'MAINTENANCE', 'DISABLED');

CREATE TABLE "sensors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "sensor_type" "sensor_type" NOT NULL,
    "device_id" UUID NOT NULL,
    "status" "sensor_status" NOT NULL DEFAULT 'ACTIVE',
    "channel" VARCHAR(50),
    "calibration_metadata" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sensors_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "sensors_code_key" ON "sensors"("code");
CREATE INDEX "sensors_device_id_idx" ON "sensors"("device_id");
CREATE INDEX "sensors_sensor_type_idx" ON "sensors"("sensor_type");
CREATE INDEX "sensors_status_idx" ON "sensors"("status");
CREATE INDEX "sensors_created_at_idx" ON "sensors"("created_at" DESC);
