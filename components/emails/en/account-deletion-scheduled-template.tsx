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

interface AccountDeletionScheduledTemplateProps {
  name?: string;
  scheduledDate: string;
  cancelLink: string;
}

export const AccountDeletionScheduledTemplate = ({
  name,
  scheduledDate,
  cancelLink,
}: AccountDeletionScheduledTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Account deletion scheduled</Preview>
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
              We have received a request to delete your account. Your account and all data will be
              permanently deleted on the following date.
            </Text>
            <Section className="bg-[#fef2f2] rounded p-4 my-4 border-2 border-[#dc2626]">
              <Text className="text-[#991b1b] text-[14px] leading-[20px] m-0 font-semibold text-center">
                Deletion Date: {scheduledDate}
              </Text>
            </Section>
            <Text className="text-black text-[14px] leading-[24px] font-semibold">
              This action is irreversible and includes:
            </Text>
            <ul className="text-black text-[14px] leading-[24px]">
              <li>All your profile information</li>
              <li>Your account settings</li>
              <li>Your session history</li>
              <li>All associated data</li>
            </ul>
            <Text className="text-black text-[14px] leading-[24px]">
              If you have changed your mind or did not make this request, you can cancel the account
              deletion by clicking the button below.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#dc2626] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={cancelLink}
              >
                Cancel Account Deletion
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Thank you for using our service. Hope to see you again!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
