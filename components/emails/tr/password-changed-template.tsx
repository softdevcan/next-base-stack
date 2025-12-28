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

interface PasswordChangedTemplateProps {
  name?: string;
  changeTime: string;
  ipAddress?: string;
  resetLink: string;
}

export const PasswordChangedTemplate = ({
  name,
  changeTime,
  ipAddress,
  resetLink,
}: PasswordChangedTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Şifreniz değiştirildi</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Next Base Stack
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Merhaba{name ? ` ${name}` : ""},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Hesabınızın şifresi başarıyla değiştirildi.
            </Text>
            <Section className="bg-[#f4f4f4] rounded p-4 my-4">
              <Text className="text-[#333] text-[12px] leading-[20px] m-0">
                <strong>Değişiklik Zamanı:</strong> {changeTime}
              </Text>
              {ipAddress && (
                <Text className="text-[#333] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>IP Adresi:</strong> {ipAddress}
                </Text>
              )}
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Eğer bu değişikliği siz yapmadıysanız, hesabınız tehlikede olabilir. Lütfen derhal
              şifrenizi sıfırlayın.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#dc2626] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={resetLink}
              >
                Şifreyi Sıfırla
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Eğer bu değişikliği siz yaptıysanız, bu e-postayı görmezden gelebilirsiniz.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Hesabınızın güvenliği için bu bildirimi gönderiyoruz.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
