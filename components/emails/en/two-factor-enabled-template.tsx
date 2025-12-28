import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TwoFactorEnabledTemplateProps {
  name?: string;
  enableTime: string;
  method: "totp" | "sms";
  ipAddress?: string;
}

export const TwoFactorEnabledTemplate = ({
  name,
  enableTime,
  method,
  ipAddress,
}: TwoFactorEnabledTemplateProps) => {
  const methodText = method === "totp" ? "Authenticator App (TOTP)" : "SMS";

  return (
    <Html>
      <Head />
      <Preview>Two-factor authentication enabled</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Next Base Stack
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello{name ? ` ${name}` : ""},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Two-factor authentication (2FA) has been successfully enabled on your account.
            </Text>
            <Section className="bg-[#f0fdf4] rounded p-4 my-4 border border-[#86efac]">
              <Text className="text-[#166534] text-[12px] leading-[20px] m-0">
                <strong>Enabled Method:</strong> {methodText}
              </Text>
              <Text className="text-[#166534] text-[12px] leading-[20px] m-0 mt-2">
                <strong>Enable Time:</strong> {enableTime}
              </Text>
              {ipAddress && (
                <Text className="text-[#166534] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>IP Address:</strong> {ipAddress}
                </Text>
              )}
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Your account is now more secure with two-factor authentication. From now on, you will
              need to enter a verification code in addition to your password when logging in.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              If you did not make this change, please check your account settings immediately and
              contact support if necessary.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Your account security is important to us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
