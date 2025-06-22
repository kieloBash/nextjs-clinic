import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

const roles = ["PATIENT", "DOCTOR", "IT_ADMIN", "HEAD_ADMIN"];

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { roleName: role },
      update: {}, // do nothing if exists
      create: { roleName: role },
    });
  }

  console.log("✅ Roles seeded successfully.");

  const headAdminRole = await prisma.role.findUnique({ where: { roleName: "HEAD_ADMIN" } });
  const itAdminRole = await prisma.role.findUnique({ where: { roleName: "IT_ADMIN" } });

  const password = await bcrypt.hash("password", 10); // Use secure env var in production

  // Head Admin
  await prisma.user.upsert({
    where: { email: "headadmin@gmail.com" },
    update: {},
    create: {
      email: "headadmin@gmail.com",
      name: "Head Admin",
      roleId: headAdminRole!.id,
      hashedPassword: password,
      isActive: true,
    },
  });

  // IT Admin
  await prisma.user.upsert({
    where: { email: "itadmin@gmail.com" },
    update: {},
    create: {
      email: "itadmin@gmail.com",
      name: "IT Admin",
      roleId: itAdminRole!.id,
      hashedPassword: password,
      isActive: true,
    },
  });

  console.log("✅ Admin users seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
