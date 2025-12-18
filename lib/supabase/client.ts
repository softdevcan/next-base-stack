import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Supabase Client for Client-Side Operations
 * Use this for Storage, Realtime subscriptions, and other client-side features
 *
 * NOTE: For database operations, we use Drizzle ORM through the DAL
 * This client is primarily for Supabase-specific features like Storage
 */
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
