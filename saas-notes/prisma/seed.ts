/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create tenants
  const acmeTenant = await prisma.tenant.upsert({
    where: { slug: "acme" },
    update: {},
    create: {
      slug: "acme",
      name: "Acme Corporation",
      subscription: "FREE",
    },
  });

  const globexTenant = await prisma.tenant.upsert({
    where: { slug: "globex" },
    update: {},
    create: {
      slug: "globex",
      name: "Globex Corporation",
      subscription: "FREE",
    },
  });

  // Hash password for all test accounts
  const hashedPassword = await bcrypt.hash("password", 12);

  // Create users
  const acmeAdmin = await prisma.user.upsert({
    where: { email: "admin@acme.test" },
    update: {},
    create: {
      email: "admin@acme.test",
      password: hashedPassword,
      role: "ADMIN",
      tenantId: acmeTenant.id,
    },
  });

  const acmeUser = await prisma.user.upsert({
    where: { email: "user@acme.test" },
    update: {},
    create: {
      email: "user@acme.test",
      password: hashedPassword,
      role: "MEMBER",
      tenantId: acmeTenant.id,
    },
  });

  const _globexAdmin = await prisma.user.upsert({
    where: { email: "admin@globex.test" },
    update: {},
    create: {
      email: "admin@globex.test",
      password: hashedPassword,
      role: "ADMIN",
      tenantId: globexTenant.id,
    },
  });

  const globexUser = await prisma.user.upsert({
    where: { email: "user@globex.test" },
    update: {},
    create: {
      email: "user@globex.test",
      password: hashedPassword,
      role: "MEMBER",
      tenantId: globexTenant.id,
    },
  });

  // Create sample notes for testing
  await prisma.note.createMany({
    data: [
      {
        title: "Welcome to Acme",
        content: "This is your first note in the Acme workspace.",
        userId: acmeUser.id,
        tenantId: acmeTenant.id,
      },
      {
        title: "Admin Note",
        content: "This note was created by an admin user.",
        userId: acmeAdmin.id,
        tenantId: acmeTenant.id,
      },
      {
        title: "Globex Getting Started",
        content: "Welcome to Globex! This is your first note.",
        userId: globexUser.id,
        tenantId: globexTenant.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Database seeded successfully!");
  console.log("\n Test Accounts Created:");
  console.log("- admin@acme.test (password: password) - Admin at Acme");
  console.log("- user@acme.test (password: password) - Member at Acme");
  console.log("- admin@globex.test (password: password) - Admin at Globex");
  console.log("- user@globex.test (password: password) - Member at Globex");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
