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

interface NewDeviceLoginTemplateProps {
  name?: string;
  loginTime: string;
  ipAddress?: string;
  location?: string;
  device?: string;
  browser?: string;
  settingsLink: string;
}

export const NewDeviceLoginTemplate = ({
  name,
  loginTime,
  ipAddress,
  location,
  device,
  browser,
  settingsLink,
}: NewDeviceLoginTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>New device login detected</Preview>
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
              Your account was accessed from a device that has not been used before.
            </Text>
            <Section className="bg-[#fffbeb] rounded p-4 my-4 border border-[#fde68a]">
              <Text className="text-[#92400e] text-[12px] leading-[20px] m-0">
                <strong>Login Time:</strong> {loginTime}
              </Text>
              {ipAddress && (
                <Text className="text-[#92400e] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>IP Address:</strong> {ipAddress}
                </Text>
              )}
              {location && (
                <Text className="text-[#92400e] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>Location:</strong> {location}
                </Text>
              )}
              {device && (
                <Text className="text-[#92400e] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>Device:</strong> {device}
                </Text>
              )}
              {browser && (
                <Text className="text-[#92400e] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>Browser:</strong> {browser}
                </Text>
              )}
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              If this was not you, your account may be at risk. Please change your password
              immediately and check your security settings.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={settingsLink}
              >
                Go to Security Settings
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              If this login was you, you can safely ignore this email.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              We track all login activity to protect your account.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
