import {
  Body,
  Button,
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

interface TwoFactorDisabledTemplateProps {
  name?: string;
  disableTime: string;
  ipAddress?: string;
  settingsLink: string;
}

export const TwoFactorDisabledTemplate = ({
  name,
  disableTime,
  ipAddress,
  settingsLink,
}: TwoFactorDisabledTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Two-factor authentication disabled</Preview>
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
              Two-factor authentication (2FA) has been disabled on your account.
            </Text>
            <Section className="bg-[#fef2f2] rounded p-4 my-4 border border-[#fca5a5]">
              <Text className="text-[#991b1b] text-[12px] leading-[20px] m-0">
                <strong>Disable Time:</strong> {disableTime}
              </Text>
              {ipAddress && (
                <Text className="text-[#991b1b] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>IP Address:</strong> {ipAddress}
                </Text>
              )}
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Your account is now protected by password only. We recommend enabling two-factor
              authentication again for enhanced security.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              If you did not make this change, your account may be at risk. Please check your
              account settings immediately.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={settingsLink}
              >
                Go to Security Settings
              </Button>
            </Section>
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
