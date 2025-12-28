"use server";

import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function submitContactForm(formData: FormData) {
  try {
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    const result = contactFormSchema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        error: result.error.errors[0].message,
      };
    }

    // TODO: Send email notification or save to database
    // For now, just log the contact form submission
    console.log("Contact form submission:", result.data);

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
    };
  } catch (error) {
    console.error("Contact form error:", error);
    return {
      success: false,
      error: "Failed to submit contact form",
    };
  }
}
