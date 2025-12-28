/**
 * Script to create or update a user to admin role
 * Usage: npx tsx scripts/create-admin.ts <email>
 */

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function createAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Please provide an email address");
    console.log("Usage: npx tsx scripts/create-admin.ts <email>");
    process.exit(1);
  }

  try {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!existingUser) {
      console.error(`❌ User with email ${email} not found`);
      console.log("Please register this user first, then run this script.");
      process.exit(1);
    }

    // Update user role to admin
    await db
      .update(users)
      .set({
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    console.log(`✅ Successfully updated ${email} to admin role`);
    console.log(`User ID: ${existingUser.id}`);
    console.log(`Name: ${existingUser.name || "Not set"}`);
  } catch (error) {
    console.error("❌ Error updating user:", error);
    process.exit(1);
  }

  process.exit(0);
}

createAdmin();
