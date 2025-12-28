import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use DATABASE_URL from environment (no validation)
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || "",
  },
} satisfies Config;
