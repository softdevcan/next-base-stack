import type { Config } from "drizzle-kit";
import { env } from "./lib/env";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use DIRECT_DATABASE_URL for migrations (bypasses Supavisor pooler)
    // This is required for DDL operations (CREATE, ALTER, DROP)
    url: env.DIRECT_DATABASE_URL || env.DATABASE_URL,
  },
} satisfies Config;
