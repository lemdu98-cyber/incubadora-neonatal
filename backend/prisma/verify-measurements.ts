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
  >`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('measurement_definitions','sensor_capabilities') ORDER BY table_name`;
  const constraints = await prisma.$queryRaw<
    Array<{ table_name: string; name: string; definition: string }>
  >`SELECT conrelid::regclass::text AS table_name,conname AS name,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid IN ('public.measurement_definitions'::regclass,'public.sensor_capabilities'::regclass) ORDER BY table_name,name`;
  const indexes = await prisma.$queryRaw<
    Array<{ table_name: string; name: string; definition: string }>
  >`SELECT tablename AS table_name,indexname AS name,indexdef AS definition FROM pg_indexes WHERE schemaname='public' AND tablename IN ('measurement_definitions','sensor_capabilities') ORDER BY tablename,indexname`;
  const enums = await prisma.$queryRaw<
    Array<{ type: string; value: string }>
  >`SELECT t.typname AS type,e.enumlabel AS value FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname IN ('measurement_value_type','measurement_category') ORDER BY t.typname,e.enumsortorder`;
  const catalog = await prisma.measurementDefinition.findMany({
    select: {
      code: true,
      name: true,
      unitSymbol: true,
      valueType: true,
      category: true,
      decimalPlaces: true,
    },
    orderBy: { code: 'asc' },
  });
  console.log(
    JSON.stringify({ tables, constraints, indexes, enums, catalog }, null, 2),
  );
}
void main().finally(() => prisma.$disconnect());
