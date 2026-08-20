-- CreateEnum
CREATE TYPE "patient_sex" AS ENUM ('MALE', 'FEMALE', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "blood_type" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "patient_status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "medical_record_number" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "birth_date" DATE NOT NULL,
    "birth_time" TIME(0),
    "sex" "patient_sex" NOT NULL,
    "birth_weight_grams" INTEGER NOT NULL,
    "gestational_age_weeks" SMALLINT NOT NULL,
    "gestational_age_days" SMALLINT NOT NULL,
    "blood_type" "blood_type" NOT NULL,
    "status" "patient_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "patients_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "patients_birth_weight_grams_check" CHECK ("birth_weight_grams" BETWEEN 1 AND 20000),
    CONSTRAINT "patients_gestational_age_weeks_check" CHECK ("gestational_age_weeks" BETWEEN 0 AND 60),
    CONSTRAINT "patients_gestational_age_days_check" CHECK ("gestational_age_days" BETWEEN 0 AND 6)
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_medical_record_number_key" ON "patients"("medical_record_number");

-- CreateIndex
CREATE INDEX "patients_created_at_idx" ON "patients"("created_at" DESC);
