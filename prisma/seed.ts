import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const userEmail = process.env.USER_EMAIL;
  const userPassword = process.env.USER_PASSWORD;

  if (!email || !password) {
    console.log("ADMIN_EMAIL or ADMIN_PASSWORD is not set, seed skipped");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      role: "admin",
    },
  });

  console.log(`Seeded admin user: ${email}`);

  if (userEmail && userPassword) {
    const userPasswordHash = await bcrypt.hash(userPassword, 12);
    await prisma.user.upsert({
      where: { email: userEmail },
      update: { passwordHash: userPasswordHash },
      create: {
        email: userEmail,
        passwordHash: userPasswordHash,
        role: "user",
      },
    });

    console.log(`Seeded regular user: ${userEmail}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
