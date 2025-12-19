"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function registerAction(formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const { name, email, password } = validatedFields.data;

  // Rate limiting check
  const identifier = email;
  const rateLimitResult = await checkRateLimit(`register:${identifier}`);

  if (!rateLimitResult.success) {
    const waitTime = Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000);
    return {
      error: `Too many registration attempts. Please try again in ${waitTime} seconds.`,
    };
  }

  // Check if user exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existingUser.length > 0) {
    return { error: "Email already exists" };
  }

  // Hash password with bcrypt (salt rounds: 10)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user (email not verified yet)
  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
      emailVerified: null,
    })
    .returning();

  // Generate verification token
  const { randomBytes } = await import("node:crypto");
  const verificationToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Store verification token
  const { verificationTokens } = await import("@/lib/db/schema");
  await db.insert(verificationTokens).values({
    identifier: email,
    token: verificationToken,
    type: "email_verification",
    expires,
  });

  // Send verification email
  const { sendVerificationEmail } = await import("@/lib/mail");
  await sendVerificationEmail(email, verificationToken);

  redirect("/login?message=verify-email");
}
