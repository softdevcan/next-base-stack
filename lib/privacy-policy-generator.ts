/**
 * Privacy Policy Generator
 * Dynamically generates privacy policy content based on active features
 */

import { env } from "@/lib/env";

export interface PrivacyPolicySection {
  title: string;
  content: string[];
}

export interface PrivacyPolicyConfig {
  companyName: string;
  websiteUrl: string;
  contactEmail: string;
  effectiveDate: string;
  features: {
    authentication: boolean;
    oauth: boolean;
    twoFactor: boolean;
    emailVerification: boolean;
    cookies: boolean;
    analytics: boolean;
    marketing: boolean;
    stripe: boolean;
    subscriptions: boolean;
    dataExport: boolean;
    accountDeletion: boolean;
    activityLogs: boolean;
  };
}

/**
 * Generate privacy policy sections based on active features
 */
export function generatePrivacyPolicy(config: PrivacyPolicyConfig): PrivacyPolicySection[] {
  const sections: PrivacyPolicySection[] = [];

  // 1. Introduction
  sections.push({
    title: "Introduction",
    content: [
      `Welcome to ${config.companyName}. We respect your privacy and are committed to protecting your personal data.`,
      `This privacy policy will inform you about how we look after your personal data when you visit our website (${config.websiteUrl}) and tell you about your privacy rights.`,
      `This policy is effective as of ${config.effectiveDate}.`,
    ],
  });

  // 2. Data We Collect
  const dataCollected: string[] = [
    "**Identity Data:** Name, username or similar identifier.",
    "**Contact Data:** Email address.",
  ];

  if (config.features.authentication) {
    dataCollected.push("**Authentication Data:** Passwords (hashed and encrypted).");
  }

  if (config.features.oauth) {
    dataCollected.push(
      "**OAuth Data:** Information from third-party providers (Google, GitHub) when you sign in using OAuth."
    );
  }

  if (config.features.twoFactor) {
    dataCollected.push(
      "**Two-Factor Authentication Data:** TOTP secrets and backup codes (encrypted)."
    );
  }

  if (config.features.activityLogs) {
    dataCollected.push(
      "**Usage Data:** Information about how you use our website, including IP addresses, browser type, and activity logs."
    );
  }

  if (config.features.cookies) {
    dataCollected.push(
      "**Cookie Data:** Information collected through cookies based on your consent preferences."
    );
  }

  if (config.features.stripe) {
    dataCollected.push(
      "**Payment Data:** Payment card details are processed by our payment provider (Stripe) and we do not store full card details."
    );
  }

  sections.push({
    title: "What Data We Collect",
    content: [
      "We collect, use, store and transfer different kinds of personal data about you:",
      ...dataCollected,
    ],
  });

  // 3. How We Use Your Data
  const dataUses: string[] = [
    "To register you as a new user and manage your account.",
    "To provide and maintain our services.",
    "To notify you about changes to our services.",
    "To provide customer support.",
  ];

  if (config.features.emailVerification) {
    dataUses.push("To verify your email address and prevent fraud.");
  }

  if (config.features.stripe) {
    dataUses.push("To process payments and billing.");
  }

  if (config.features.subscriptions) {
    dataUses.push("To manage your subscription and provide you with the services you've purchased.");
  }

  if (config.features.analytics) {
    dataUses.push("To analyze usage and improve our services (with your consent).");
  }

  if (config.features.marketing) {
    dataUses.push("To send you marketing communications (with your consent).");
  }

  sections.push({
    title: "How We Use Your Data",
    content: ["We use your personal data for the following purposes:", ...dataUses],
  });

  // 4. Legal Basis for Processing
  sections.push({
    title: "Legal Basis for Processing",
    content: [
      "We process your personal data under the following legal bases:",
      "**Consent:** You have given clear consent for us to process your personal data for specific purposes (e.g., cookies, analytics, marketing).",
      "**Contract:** Processing is necessary to fulfill a contract with you.",
      "**Legal Obligation:** Processing is necessary to comply with the law.",
      "**Legitimate Interests:** Processing is necessary for our legitimate interests (e.g., fraud prevention, improving services).",
    ],
  });

  // 5. Data Sharing
  const dataSharing: string[] = [
    "We do not sell your personal data to third parties.",
    "We may share your data with:",
  ];

  if (config.features.stripe) {
    dataSharing.push("**Payment Processors:** Stripe for payment processing.");
  }

  if (config.features.oauth) {
    dataSharing.push(
      "**Authentication Providers:** Google, GitHub for OAuth authentication."
    );
  }

  if (config.features.analytics) {
    dataSharing.push("**Analytics Providers:** To help us analyze usage (with your consent).");
  }

  dataSharing.push(
    "**Legal Requirements:** When required by law or to protect our rights.",
    "**Service Providers:** Third-party vendors who provide services on our behalf (under strict confidentiality agreements)."
  );

  sections.push({
    title: "Data Sharing and Transfers",
    content: dataSharing,
  });

  // 6. Data Security
  sections.push({
    title: "Data Security",
    content: [
      "We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, accessed, altered, or disclosed in an unauthorized way.",
      "Security measures include:",
      "- Password hashing using bcrypt",
      "- Encrypted data transmission (HTTPS)",
      "- Secure session management",
      "- CSRF protection",
      config.features.twoFactor ? "- Two-factor authentication available" : "",
      "- Regular security updates and patches",
      "- Access controls and authentication requirements",
    ].filter(Boolean),
  });

  // 7. Data Retention
  sections.push({
    title: "Data Retention",
    content: [
      "We will only retain your personal data for as long as necessary to fulfill the purposes for which it was collected.",
      "Account data is retained for the lifetime of your account.",
      config.features.activityLogs
        ? "Activity logs are retained for security and audit purposes."
        : "",
      config.features.accountDeletion
        ? "You can request deletion of your account and all associated data at any time."
        : "",
    ].filter(Boolean),
  });

  // 8. Your Rights
  const yourRights: string[] = [
    "**Access:** Request access to your personal data.",
    "**Rectification:** Request correction of inaccurate data.",
    "**Erasure:** Request deletion of your data.",
    "**Restriction:** Request restriction of processing.",
    "**Data Portability:** Request transfer of your data.",
    "**Objection:** Object to processing of your data.",
    "**Withdraw Consent:** Withdraw consent at any time.",
  ];

  if (config.features.dataExport) {
    yourRights.push(
      "**Data Export:** Download all your personal data in JSON or CSV format."
    );
  }

  if (config.features.accountDeletion) {
    yourRights.push("**Account Deletion:** Permanently delete your account and all data.");
  }

  sections.push({
    title: "Your Rights",
    content: [
      "Under data protection laws, you have the following rights:",
      ...yourRights,
      `To exercise any of these rights, please contact us at ${config.contactEmail}.`,
    ],
  });

  // 9. Cookies
  if (config.features.cookies) {
    sections.push({
      title: "Cookies",
      content: [
        "We use cookies to enhance your browsing experience and analyze our traffic.",
        "Our cookie consent banner allows you to control which cookies you accept:",
        "**Necessary Cookies:** Required for the website to function (always active).",
        "**Functional Cookies:** Enable enhanced functionality and personalization.",
        "**Analytics Cookies:** Help us understand how visitors interact with our website.",
        "**Marketing Cookies:** Used to track visitors for advertising purposes.",
        "You can change your cookie preferences at any time through your account settings or by clearing your browser cookies.",
      ],
    });
  }

  // 10. Third-Party Services
  const thirdPartyServices: string[] = [];

  if (config.features.oauth) {
    thirdPartyServices.push(
      "**Google OAuth:** For authentication via Google accounts.",
      "**GitHub OAuth:** For authentication via GitHub accounts."
    );
  }

  if (config.features.stripe) {
    thirdPartyServices.push(
      "**Stripe:** For payment processing. View Stripe's privacy policy at https://stripe.com/privacy."
    );
  }

  if (thirdPartyServices.length > 0) {
    sections.push({
      title: "Third-Party Services",
      content: [
        "We use the following third-party services:",
        ...thirdPartyServices,
        "These services have their own privacy policies and we recommend you review them.",
      ],
    });
  }

  // 11. International Transfers
  sections.push({
    title: "International Data Transfers",
    content: [
      "Your data may be transferred to and stored in countries outside your country of residence.",
      "We ensure that such transfers are protected by appropriate safeguards in accordance with data protection laws.",
    ],
  });

  // 12. Children's Privacy
  sections.push({
    title: "Children's Privacy",
    content: [
      "Our services are not intended for children under 13 years of age.",
      "We do not knowingly collect personal data from children under 13.",
      "If you are a parent or guardian and believe your child has provided us with personal data, please contact us.",
    ],
  });

  // 13. Changes to This Policy
  sections.push({
    title: "Changes to This Privacy Policy",
    content: [
      "We may update this privacy policy from time to time.",
      "We will notify you of any changes by posting the new policy on this page and updating the 'Effective Date' at the top.",
      "We encourage you to review this policy periodically.",
    ],
  });

  // 14. Contact Us
  sections.push({
    title: "Contact Us",
    content: [
      "If you have any questions about this privacy policy or our privacy practices, please contact us:",
      `Email: ${config.contactEmail}`,
      `Website: ${config.websiteUrl}`,
    ],
  });

  return sections;
}

/**
 * Get the current feature configuration from environment and app state
 */
export function getFeatureConfig(): PrivacyPolicyConfig["features"] {
  return {
    authentication: true, // Always enabled in this stack
    oauth: !!(env.GOOGLE_CLIENT_ID && env.GITHUB_CLIENT_ID),
    twoFactor: true, // Feature is implemented
    emailVerification: true, // Feature is implemented
    cookies: true, // Cookie consent is implemented
    analytics: false, // User can enable via cookie consent
    marketing: false, // User can enable via cookie consent
    stripe: !!env.STRIPE_SECRET_KEY,
    subscriptions: !!env.STRIPE_SECRET_KEY,
    dataExport: true, // Feature is implemented
    accountDeletion: true, // Feature is implemented
    activityLogs: true, // Feature is implemented
  };
}
