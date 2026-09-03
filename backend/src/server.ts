import { buildApp } from "./app.js";
import { env } from "./lib/env.js";
import { disconnectPrisma } from "./lib/prisma.js";

const app = buildApp();

async function main() {
  await app.listen({ port: env.port, host: env.host });
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await app.close();
    await disconnectPrisma();
    process.exit(0);
  });
}

main().catch((error) => {
  app.log.error(error);
  process.exit(1);
});
