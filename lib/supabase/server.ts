import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Supabase Admin Client for Server-Side Operations
 * Use SERVICE_ROLE_KEY to bypass RLS (Row Level Security)
 *
 * WARNING: Only use this in server-side code (Server Components, Server Actions, API Routes)
 * Never expose SERVICE_ROLE_KEY to the client
 *
 * Use cases:
 * - Admin operations
 * - Bypassing RLS for system operations
 * - Storage admin operations
 *
 * NOTE: For database operations, we use Drizzle ORM through the DAL
 * This client is primarily for Supabase-specific admin features
 */
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
