CREATE TYPE "admission_status" AS ENUM ('ACTIVE', 'DISCHARGED', 'TRANSFERRED', 'CANCELLED');

CREATE TABLE "admissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL,
    "incubator_id" UUID NOT NULL,
    "admitted_at" TIMESTAMPTZ(6) NOT NULL,
    "discharged_at" TIMESTAMPTZ(6),
    "status" "admission_status" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admissions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "admissions_discharge_after_admission_check" CHECK ("discharged_at" IS NULL OR "discharged_at" >= "admitted_at"),
    CONSTRAINT "admissions_active_has_no_discharge_check" CHECK (("status" = 'ACTIVE' AND "discharged_at" IS NULL) OR ("status" <> 'ACTIVE' AND "discharged_at" IS NOT NULL)),
    CONSTRAINT "admissions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "admissions_incubator_id_fkey" FOREIGN KEY ("incubator_id") REFERENCES "incubators"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "admissions_patient_id_admitted_at_idx" ON "admissions"("patient_id", "admitted_at" DESC);
CREATE INDEX "admissions_incubator_id_admitted_at_idx" ON "admissions"("incubator_id", "admitted_at" DESC);
CREATE INDEX "admissions_status_idx" ON "admissions"("status");
CREATE INDEX "admissions_admitted_at_idx" ON "admissions"("admitted_at" DESC);
CREATE UNIQUE INDEX "admissions_one_active_per_patient_idx" ON "admissions"("patient_id") WHERE "status" = 'ACTIVE';
CREATE UNIQUE INDEX "admissions_one_active_per_incubator_idx" ON "admissions"("incubator_id") WHERE "status" = 'ACTIVE';
