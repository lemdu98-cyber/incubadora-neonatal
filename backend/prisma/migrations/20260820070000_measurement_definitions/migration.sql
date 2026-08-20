CREATE TYPE "measurement_value_type" AS ENUM ('FLOAT', 'INTEGER', 'BOOLEAN');
CREATE TYPE "measurement_category" AS ENUM ('ENVIRONMENTAL', 'PHYSIOLOGICAL', 'TECHNICAL');

CREATE TABLE "measurement_definitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(60) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "unit_symbol" VARCHAR(30) NOT NULL,
    "value_type" "measurement_value_type" NOT NULL,
    "category" "measurement_category" NOT NULL,
    "description" VARCHAR(255),
    "decimal_places" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "measurement_definitions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "measurement_definitions_decimal_places_check" CHECK ("decimal_places" BETWEEN 0 AND 6)
);

CREATE TABLE "sensor_capabilities" (
    "sensor_id" UUID NOT NULL,
    "measurement_definition_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sensor_capabilities_pkey" PRIMARY KEY ("sensor_id", "measurement_definition_id"),
    CONSTRAINT "sensor_capabilities_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensors"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sensor_capabilities_measurement_definition_id_fkey" FOREIGN KEY ("measurement_definition_id") REFERENCES "measurement_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "measurement_definitions_code_key" ON "measurement_definitions"("code");
CREATE INDEX "measurement_definitions_category_idx" ON "measurement_definitions"("category");
CREATE INDEX "measurement_definitions_created_at_idx" ON "measurement_definitions"("created_at" DESC);
CREATE INDEX "sensor_capabilities_measurement_definition_id_idx" ON "sensor_capabilities"("measurement_definition_id");
