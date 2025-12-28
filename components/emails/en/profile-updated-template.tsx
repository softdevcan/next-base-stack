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

interface ProfileUpdatedTemplateProps {
  name?: string;
  updateTime: string;
  updatedFields: string[];
  settingsLink: string;
}

export const ProfileUpdatedTemplate = ({
  name,
  updateTime,
  updatedFields,
  settingsLink,
}: ProfileUpdatedTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your profile has been updated</Preview>
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
              Your profile information has been successfully updated.
            </Text>
            <Section className="bg-[#f0f9ff] rounded p-4 my-4 border border-[#93c5fd]">
              <Text className="text-[#1e3a8a] text-[12px] leading-[20px] m-0">
                <strong>Update Time:</strong> {updateTime}
              </Text>
              <Text className="text-[#1e3a8a] text-[12px] leading-[20px] m-0 mt-2">
                <strong>Updated Fields:</strong>
              </Text>
              <ul className="text-[#1e3a8a] text-[12px] leading-[20px] ml-4 mt-1">
                {updatedFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              If you did not make these changes, please check your account settings immediately.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={settingsLink}
              >
                View Profile
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              We keep you informed about profile changes.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
