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
    WHERE table_schema = 'public' AND table_name = 'incubators'`;
  const columns = await prisma.$queryRaw<
    Array<{ column_name: string; is_nullable: string; data_type: string }>
  >`
    SELECT column_name, is_nullable, data_type FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'incubators' ORDER BY ordinal_position`;
  const constraints = await prisma.$queryRaw<
    Array<{ name: string; definition: string }>
  >`
    SELECT conname AS name, pg_get_constraintdef(oid) AS definition FROM pg_constraint
    WHERE conrelid = 'public.incubators'::regclass ORDER BY conname`;
  const indexes = await prisma.$queryRaw<
    Array<{ name: string; definition: string }>
  >`
    SELECT indexname AS name, indexdef AS definition FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'incubators' ORDER BY indexname`;
  const enumValues = await prisma.$queryRaw<Array<{ value: string }>>`
    SELECT enumlabel AS value FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'incubator_status' ORDER BY e.enumsortorder`;
  console.log(
    JSON.stringify(
      { tables, columns, constraints, indexes, enumValues },
      null,
      2,
    ),
  );
}

void main().finally(() => prisma.$disconnect());
