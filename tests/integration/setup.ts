// tests/setup.integration.ts
import { prisma } from "../../src/utils/prisma";

process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.ACCESS_TOKEN_EXPIRES_IN = "15m";
process.env.REFRESH_TOKEN_EXPIRES_IN = "7d";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid"),
}));

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  const tablenames = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname='public'
  `;

  const tables = tablenames.map(({ tablename }) => `"${tablename}"`).join(", ");

  if (tables.length > 0) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`,
    );
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
