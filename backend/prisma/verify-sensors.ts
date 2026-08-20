import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required.');
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const table = await prisma.$queryRaw<
    Array<{ table_name: string }>
  >`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='sensors'`;
  const constraints = await prisma.$queryRaw<
    Array<{ name: string; definition: string }>
  >`SELECT conname AS name,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid='public.sensors'::regclass ORDER BY conname`;
  const indexes = await prisma.$queryRaw<
    Array<{ name: string; definition: string }>
  >`SELECT indexname AS name,indexdef AS definition FROM pg_indexes WHERE schemaname='public' AND tablename='sensors' ORDER BY indexname`;
  const enums = await prisma.$queryRaw<
    Array<{ type: string; value: string }>
  >`SELECT t.typname AS type,e.enumlabel AS value FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname IN ('sensor_type','sensor_status') ORDER BY t.typname,e.enumsortorder`;
  console.log(JSON.stringify({ table, constraints, indexes, enums }, null, 2));
}
void main().finally(() => prisma.$disconnect());
