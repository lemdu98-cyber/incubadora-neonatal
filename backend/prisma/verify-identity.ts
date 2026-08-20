import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is required to verify identity infrastructure.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type ConstraintRow = {
  constraint_name: string;
  definition: string;
};

type IndexRow = {
  index_name: string;
  definition: string;
};

async function main(): Promise<void> {
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('profiles', 'roles', 'user_roles')
    ORDER BY table_name
  `;

  const constraints = await prisma.$queryRaw<ConstraintRow[]>`
    SELECT constraint_name, pg_get_constraintdef(pc.oid) AS definition
    FROM information_schema.table_constraints tc
    JOIN pg_constraint pc ON pc.conname = tc.constraint_name
    JOIN pg_class rel ON rel.oid = pc.conrelid
    JOIN pg_namespace ns ON ns.oid = rel.relnamespace
    WHERE tc.table_schema = 'public'
      AND tc.table_name IN ('profiles', 'roles', 'user_roles')
      AND ns.nspname = 'public'
    ORDER BY constraint_name
  `;

  const indexes = await prisma.$queryRaw<IndexRow[]>`
    SELECT indexname AS index_name, indexdef AS definition
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname IN ('roles_code_key', 'user_roles_role_id_idx')
    ORDER BY indexname
  `;

  const enumValues = await prisma.$queryRaw<Array<{ value: string }>>`
    SELECT enumlabel AS value
    FROM pg_enum
    JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
    JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
    WHERE pg_namespace.nspname = 'public'
      AND pg_type.typname = 'profile_status'
    ORDER BY enumsortorder
  `;

  const roles = await prisma.role.findMany({
    select: { code: true },
    orderBy: { code: 'asc' },
  });

  console.log(
    JSON.stringify(
      {
        tables: tables.map(({ table_name }) => table_name),
        constraints,
        indexes,
        profileStatus: enumValues.map(({ value }) => value),
        roles: roles.map(({ code }) => code),
      },
      null,
      2,
    ),
  );
}

void main().finally(async () => {
  await prisma.$disconnect();
});
