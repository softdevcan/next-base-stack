// Turkish templates
import { AccountDeletionScheduledTemplate as AccountDeletionScheduledTemplateTR } from "@/components/emails/tr/account-deletion-scheduled-template";
import { NewDeviceLoginTemplate as NewDeviceLoginTemplateTR } from "@/components/emails/tr/new-device-login-template";
import { PasswordChangedTemplate as PasswordChangedTemplateTR } from "@/components/emails/tr/password-changed-template";
import { ProfileUpdatedTemplate as ProfileUpdatedTemplateTR } from "@/components/emails/tr/profile-updated-template";
import { TwoFactorDisabledTemplate as TwoFactorDisabledTemplateTR } from "@/components/emails/tr/two-factor-disabled-template";
import { TwoFactorEnabledTemplate as TwoFactorEnabledTemplateTR } from "@/components/emails/tr/two-factor-enabled-template";

// English templates
import { AccountDeletionScheduledTemplate as AccountDeletionScheduledTemplateEN } from "@/components/emails/en/account-deletion-scheduled-template";
import { NewDeviceLoginTemplate as NewDeviceLoginTemplateEN } from "@/components/emails/en/new-device-login-template";
import { PasswordChangedTemplate as PasswordChangedTemplateEN } from "@/components/emails/en/password-changed-template";
import { ProfileUpdatedTemplate as ProfileUpdatedTemplateEN } from "@/components/emails/en/profile-updated-template";
import { TwoFactorDisabledTemplate as TwoFactorDisabledTemplateEN } from "@/components/emails/en/two-factor-disabled-template";
import { TwoFactorEnabledTemplate as TwoFactorEnabledTemplateEN } from "@/components/emails/en/two-factor-enabled-template";

// Common templates (not localized yet)
import { ResetPasswordTemplate } from "@/components/emails/reset-password-template";
import { VerifyEmailTemplate } from "@/components/emails/verify-email-template";
import { WelcomeEmailTemplate } from "@/components/emails/welcome-email-template";

import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { eq } from "drizzle-orm";
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
 * Get user's email notification preferences and locale
 */
async function getUserEmailPreferences(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) return null;

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);

  // If no profile exists, return default preferences (all enabled except profileUpdated)
  if (!profile) {
    return {
      locale: "tr", // default locale
      passwordChanged: true,
      twoFactorEnabled: true,
      twoFactorDisabled: true,
      newDeviceLogin: true,
      profileUpdated: false,
      accountDeletion: true,
    };
  }

  return {
    locale: profile.locale || "tr",
    passwordChanged: profile.emailNotificationPasswordChanged,
    twoFactorEnabled: profile.emailNotification2faEnabled,
    twoFactorDisabled: profile.emailNotification2faDisabled,
    newDeviceLogin: profile.emailNotificationNewDeviceLogin,
    profileUpdated: profile.emailNotificationProfileUpdated,
    accountDeletion: profile.emailNotificationAccountDeletion,
  };
}

/**
 * Get localized date string
 */
function getLocalizedDate(locale: string): string {
  return new Date().toLocaleString(locale === "en" ? "en-US" : "tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

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

/**
 * Send a password changed notification email
 */
export async function sendPasswordChangedEmail(email: string, name?: string, ipAddress?: string) {
  // Check user preferences and get locale
  const preferences = await getUserEmailPreferences(email);
  if (!preferences?.passwordChanged) {
    return { success: true, skipped: true };
  }

  const locale = preferences.locale || "tr";
  const resetLink = `${env.NEXT_PUBLIC_APP_URL}/${locale}/reset-password`;
  const changeTime = new Date().toLocaleString(locale === "en" ? "en-US" : "tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  // Select template based on locale
  const PasswordChangedTemplate =
    locale === "en" ? PasswordChangedTemplateEN : PasswordChangedTemplateTR;
  const subject = locale === "en" ? "Your Password Has Been Changed" : "Şifreniz Değiştirildi";

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject,
      react: PasswordChangedTemplate({ name, changeTime, ipAddress, resetLink }),
    });

    if (error) {
      console.error("Error sending password changed email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending password changed email:", error);
    return { success: false, error };
  }
}

/**
 * Send a 2FA enabled notification email
 */
export async function sendTwoFactorEnabledEmail(
  email: string,
  method: "totp" | "sms",
  name?: string,
  ipAddress?: string,
) {
  // Check user preferences and get locale
  const preferences = await getUserEmailPreferences(email);
  if (!preferences?.twoFactorEnabled) {
    return { success: true, skipped: true };
  }

  const locale = preferences.locale || "tr";
  const enableTime = getLocalizedDate(locale);

  // Select template based on locale
  const TwoFactorEnabledTemplate =
    locale === "en" ? TwoFactorEnabledTemplateEN : TwoFactorEnabledTemplateTR;
  const subject =
    locale === "en"
      ? "Two-Factor Authentication Enabled"
      : "İki Faktörlü Kimlik Doğrulama Aktif Edildi";

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject,
      react: TwoFactorEnabledTemplate({ name, enableTime, method, ipAddress }),
    });

    if (error) {
      console.error("Error sending 2FA enabled email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending 2FA enabled email:", error);
    return { success: false, error };
  }
}

/**
 * Send a 2FA disabled notification email
 */
export async function sendTwoFactorDisabledEmail(email: string, name?: string, ipAddress?: string) {
  // Check user preferences and get locale
  const preferences = await getUserEmailPreferences(email);
  if (!preferences?.twoFactorDisabled) {
    return { success: true, skipped: true };
  }

  const locale = preferences.locale || "tr";
  const settingsLink = `${env.NEXT_PUBLIC_APP_URL}/${locale}/settings/security`;
  const disableTime = getLocalizedDate(locale);

  // Select template based on locale
  const TwoFactorDisabledTemplate =
    locale === "en" ? TwoFactorDisabledTemplateEN : TwoFactorDisabledTemplateTR;
  const subject =
    locale === "en"
      ? "Two-Factor Authentication Disabled"
      : "İki Faktörlü Kimlik Doğrulama Devre Dışı Bırakıldı";

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject,
      react: TwoFactorDisabledTemplate({ name, disableTime, ipAddress, settingsLink }),
    });

    if (error) {
      console.error("Error sending 2FA disabled email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending 2FA disabled email:", error);
    return { success: false, error };
  }
}

/**
 * Send a new device login notification email
 */
export async function sendNewDeviceLoginEmail(
  email: string,
  name?: string,
  ipAddress?: string,
  location?: string,
  device?: string,
  browser?: string,
) {
  // Check user preferences and get locale
  const preferences = await getUserEmailPreferences(email);
  if (!preferences?.newDeviceLogin) {
    return { success: true, skipped: true };
  }

  const locale = preferences.locale || "tr";
  const settingsLink = `${env.NEXT_PUBLIC_APP_URL}/${locale}/settings/security`;
  const loginTime = getLocalizedDate(locale);

  // Select template based on locale
  const NewDeviceLoginTemplate =
    locale === "en" ? NewDeviceLoginTemplateEN : NewDeviceLoginTemplateTR;
  const subject = locale === "en" ? "New Device Login Detected" : "Yeni Cihazdan Giriş Yapıldı";

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject,
      react: NewDeviceLoginTemplate({
        name,
        loginTime,
        ipAddress,
        location,
        device,
        browser,
        settingsLink,
      }),
    });

    if (error) {
      console.error("Error sending new device login email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending new device login email:", error);
    return { success: false, error };
  }
}

/**
 * Send a profile updated notification email
 */
export async function sendProfileUpdatedEmail(
  email: string,
  updatedFields: string[],
  name?: string,
) {
  // Check user preferences and get locale
  const preferences = await getUserEmailPreferences(email);
  if (!preferences?.profileUpdated) {
    return { success: true, skipped: true };
  }

  const locale = preferences.locale || "tr";
  const settingsLink = `${env.NEXT_PUBLIC_APP_URL}/${locale}/settings`;
  const updateTime = getLocalizedDate(locale);

  // Translate field names based on locale
  const localizedFields =
    locale === "en"
      ? updatedFields.map((field) =>
          field === "Ad" ? "Name" : field === "Biyografi" ? "Bio" : field,
        )
      : updatedFields;

  // Select template based on locale
  const ProfileUpdatedTemplate =
    locale === "en" ? ProfileUpdatedTemplateEN : ProfileUpdatedTemplateTR;
  const subject =
    locale === "en" ? "Your Profile Has Been Updated" : "Profil Bilgileriniz Güncellendi";

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject,
      react: ProfileUpdatedTemplate({
        name,
        updateTime,
        updatedFields: localizedFields,
        settingsLink,
      }),
    });

    if (error) {
      console.error("Error sending profile updated email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending profile updated email:", error);
    return { success: false, error };
  }
}

/**
 * Send an account deletion scheduled notification email
 */
export async function sendAccountDeletionScheduledEmail(
  email: string,
  scheduledDate: string,
  name?: string,
) {
  // Check user preferences and get locale
  const preferences = await getUserEmailPreferences(email);
  if (!preferences?.accountDeletion) {
    return { success: true, skipped: true };
  }

  const locale = preferences.locale || "tr";
  const cancelLink = `${env.NEXT_PUBLIC_APP_URL}/${locale}/settings/account`;

  // Select template based on locale
  const AccountDeletionScheduledTemplate =
    locale === "en" ? AccountDeletionScheduledTemplateEN : AccountDeletionScheduledTemplateTR;
  const subject = locale === "en" ? "Account Deletion Scheduled" : "Hesap Silme İşlemi Planlandı";

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject,
      react: AccountDeletionScheduledTemplate({ name, scheduledDate, cancelLink }),
    });

    if (error) {
      console.error("Error sending account deletion scheduled email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending account deletion scheduled email:", error);
    return { success: false, error };
  }
}
