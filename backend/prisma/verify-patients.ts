import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required.');
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'patients'
  `;
  const constraints = await prisma.$queryRaw<
    Array<{ name: string; definition: string }>
  >`
    SELECT conname AS name, pg_get_constraintdef(oid) AS definition
    FROM pg_constraint WHERE conrelid = 'public.patients'::regclass ORDER BY conname
  `;
  const indexes = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT indexname AS name FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'patients' ORDER BY indexname
  `;
  const enums = await prisma.$queryRaw<Array<{ name: string; value: string }>>`
    SELECT t.typname AS name, e.enumlabel AS value FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname IN ('patient_sex','blood_type','patient_status')
    ORDER BY t.typname, e.enumsortorder
  `;
  console.log(
    JSON.stringify(
      {
        tables: tables.map((x) => x.table_name),
        constraints,
        indexes: indexes.map((x) => x.name),
        enums,
      },
      null,
      2,
    ),
  );
}
void main().finally(() => prisma.$disconnect());
