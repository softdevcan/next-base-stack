import { ResetPasswordTemplate } from "@/components/emails/reset-password-template";
import { VerifyEmailTemplate } from "@/components/emails/verify-email-template";
import { WelcomeEmailTemplate } from "@/components/emails/welcome-email-template";
import { env } from "@/lib/env";
import { Resend } from "resend";

/**
 * Resend client instance
 */
const resend = new Resend(env.RESEND_API_KEY);

/**
 * Sender email address
 * Use "onboarding@resend.dev" for testing without domain verification
 */
const EMAIL_SENDER = "Next Base Stack <onboarding@resend.dev>";

/**
 * Send a verification email to the user
 */
export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject: "E-posta Adresinizi Doğrulayın",
      react: VerifyEmailTemplate({ confirmLink }),
    });

    if (error) {
      console.error("Error sending verification email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
}

/**
 * Send a password reset email to the user
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject: "Şifrenizi Sıfırlayın",
      react: ResetPasswordTemplate({ resetLink }),
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
}

/**
 * Send a welcome email to the user
 */
export async function sendWelcomeEmail(email: string, name?: string) {
  const dashboardLink = `${env.NEXT_PUBLIC_APP_URL}/dashboard`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject: "Next Base Stack'e Hoş Geldiniz!",
      react: WelcomeEmailTemplate({ name, dashboardLink }),
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
}
