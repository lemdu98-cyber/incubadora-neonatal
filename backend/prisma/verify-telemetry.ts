import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required.');
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
async function main() {
  const table =
    await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='telemetry'`;
  const columns =
    await prisma.$queryRaw`SELECT column_name,data_type,is_nullable,column_default,is_identity,identity_generation FROM information_schema.columns WHERE table_schema='public' AND table_name='telemetry' ORDER BY ordinal_position`;
  const constraints =
    await prisma.$queryRaw`SELECT conname AS name,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='public.telemetry'::regclass ORDER BY conname`;
  const indexes =
    await prisma.$queryRaw`SELECT indexname AS name,indexdef AS definition FROM pg_indexes WHERE schemaname='public' AND tablename='telemetry' ORDER BY indexname`;
  const enums =
    await prisma.$queryRaw`SELECT e.enumlabel AS value FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='telemetry_quality' ORDER BY e.enumsortorder`;
  const count = await prisma.telemetry.count();
  console.log(
    JSON.stringify(
      { table, columns, constraints, indexes, enums, rowCount: count },
      null,
      2,
    ),
  );
}
void main().finally(() => prisma.$disconnect());
