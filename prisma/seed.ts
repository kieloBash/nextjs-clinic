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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
