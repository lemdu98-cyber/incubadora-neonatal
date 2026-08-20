import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required.');
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
async function main() {
  const tables = await prisma.$queryRaw<
    Array<{ table_name: string }>
  >`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('guardians','patient_guardians') ORDER BY table_name`;
  const constraints = await prisma.$queryRaw<
    Array<{ name: string; definition: string }>
  >`SELECT conname AS name,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid IN ('public.guardians'::regclass,'public.patient_guardians'::regclass) ORDER BY conname`;
  const indexes = await prisma.$queryRaw<
    Array<{ name: string }>
  >`SELECT indexname AS name FROM pg_indexes WHERE schemaname='public' AND tablename IN ('guardians','patient_guardians') ORDER BY indexname`;
  console.log(
    JSON.stringify(
      {
        tables: tables.map((x) => x.table_name),
        constraints,
        indexes: indexes.map((x) => x.name),
      },
      null,
      2,
    ),
  );
}
void main().finally(() => prisma.$disconnect());
