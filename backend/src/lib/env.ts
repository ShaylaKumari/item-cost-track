export const env = {
  get databaseUrl(): string | undefined {
    return process.env["DATABASE_URL"];
  },
  get port(): number {
    return Number(process.env["PORT"] ?? 3333);
  },
  get host(): string {
    return process.env["HOST"] ?? "0.0.0.0";
  },
};
