-- CreateEnum
CREATE TYPE "guardian_relationship" AS ENUM ('MOTHER', 'FATHER', 'LEGAL_GUARDIAN', 'GRANDMOTHER', 'GRANDFATHER', 'OTHER');

-- CreateTable
CREATE TABLE "guardians" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "document_number" VARCHAR(80),
    "phone" VARCHAR(40),
    "email" VARCHAR(254),
    "address" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "guardians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_guardians" (
    "patient_id" UUID NOT NULL,
    "guardian_id" UUID NOT NULL,
    "relationship" "guardian_relationship" NOT NULL,
    "is_primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "patient_guardians_pkey" PRIMARY KEY ("patient_id", "guardian_id")
);

CREATE INDEX "guardians_document_number_idx" ON "guardians"("document_number");
CREATE INDEX "guardians_created_at_idx" ON "guardians"("created_at" DESC);
CREATE INDEX "patient_guardians_guardian_id_idx" ON "patient_guardians"("guardian_id");
CREATE UNIQUE INDEX "patient_guardians_one_primary_per_patient_idx" ON "patient_guardians"("patient_id") WHERE "is_primary_contact" = true;

ALTER TABLE "patient_guardians" ADD CONSTRAINT "patient_guardians_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "patient_guardians" ADD CONSTRAINT "patient_guardians_guardian_id_fkey" FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
