"use server";

import { auth } from "@/auth";
import { getCurrentUser, updateCurrentUserProfile } from "@/lib/db/queries";
import { sendProfileUpdatedEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
});

export async function updateProfileAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const validatedFields = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields");
  }

  // Get current user data to compare changes
  const currentUser = await getCurrentUser();

  // Track which fields were updated
  const updatedFields: string[] = [];

  if (validatedFields.data.name && validatedFields.data.name !== currentUser?.name) {
    updatedFields.push("Ad");
  }

  if (validatedFields.data.bio !== undefined) {
    updatedFields.push("Biyografi");
  }

  // Update profile
  await updateCurrentUserProfile(validatedFields.data);

  // Send email notification if any fields were updated
  if (updatedFields.length > 0) {
    await sendProfileUpdatedEmail(
      session.user.email,
      updatedFields,
      session.user.name ?? undefined,
    );
  }

  revalidatePath("/profile");

  return { success: true };
}
