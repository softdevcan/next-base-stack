"use server";

import { updateCurrentUserProfile } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
});

export async function updateProfileAction(formData: FormData) {
  const validatedFields = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields");
  }

  await updateCurrentUserProfile(validatedFields.data);

  revalidatePath("/profile");

  return { success: true };
}
