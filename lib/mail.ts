import { Resend } from "resend";
import { env } from "@/lib/env";
import { VerifyEmailTemplate } from "@/components/emails/verify-email-template";
import { ResetPasswordTemplate } from "@/components/emails/reset-password-template";

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
