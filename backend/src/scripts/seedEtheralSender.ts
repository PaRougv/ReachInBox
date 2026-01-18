import nodemailer from "nodemailer";
import { prisma } from "../db/prisma";

async function main() {
  for (let i = 1; i <= 2; i++) {
    const test = await nodemailer.createTestAccount();

    const sender = await prisma.emailSender.create({
      data: {
        name: `Ethereal Sender ${i}`,
        email: test.user,
        smtpHost: test.smtp.host,
        smtpPort: test.smtp.port,
        smtpUser: test.user,
        smtpPass: test.pass
      }
    });

    console.log("✅ Created sender:", sender.email);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
