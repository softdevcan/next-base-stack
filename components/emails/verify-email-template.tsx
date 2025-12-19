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

interface VerifyEmailTemplateProps {
  confirmLink: string;
}

export const VerifyEmailTemplate = ({ confirmLink }: VerifyEmailTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>E-posta adresinizi doğrulayın</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Next Base Stack
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">Merhaba,</Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Next Base Stack hesabınızı doğrulamak için lütfen aşağıdaki butona tıklayın.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={confirmLink}
              >
                Hesabı Doğrula
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Bu e-posta sadece size özel gönderilmiştir. Lütfen başkalarıyla paylaşmayın.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
