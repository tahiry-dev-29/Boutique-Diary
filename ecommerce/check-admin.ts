import "dotenv/config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@boutique.com";
  const password = "admin123";

  console.log(`Checking admin user: ${email}`);

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    console.log("❌ Admin user NOT found.");
  } else {
    console.log("✅ Admin user found:");
    console.log(`- ID: ${admin.id}`);
    console.log(`- Name: ${admin.name}`);
    console.log(`- Role: ${admin.role}`);
    console.log(`- IsActive: ${admin.isActive}`);

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    console.log(
      `- Password 'admin123' valid: ${isPasswordValid ? "✅ YES" : "❌ NO"}`,
    );

    if (!isPasswordValid) {
      console.log("Resetting password to 'admin123'...");
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.admin.update({
        where: { id: admin.id },
        data: { password: hashedPassword },
      });
      console.log("✅ Password reset.");
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
