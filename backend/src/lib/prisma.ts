import { PrismaClient } from "@prisma/client";

/** Client Prisma único do processo. */
export const prisma = new PrismaClient();

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
