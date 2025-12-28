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
      <Preview>İki faktörlü kimlik doğrulama devre dışı bırakıldı</Preview>
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
              Hesabınızda iki faktörlü kimlik doğrulama (2FA) devre dışı bırakıldı.
            </Text>
            <Section className="bg-[#fef2f2] rounded p-4 my-4 border border-[#fca5a5]">
              <Text className="text-[#991b1b] text-[12px] leading-[20px] m-0">
                <strong>Devre Dışı Bırakılma Zamanı:</strong> {disableTime}
              </Text>
              {ipAddress && (
                <Text className="text-[#991b1b] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>IP Adresi:</strong> {ipAddress}
                </Text>
              )}
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Hesabınız artık sadece şifre ile korunuyor. Daha fazla güvenlik için iki faktörlü
              kimlik doğrulamayı tekrar aktif etmenizi öneririz.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Eğer bu değişikliği siz yapmadıysanız, hesabınız tehlikede olabilir. Lütfen derhal
              hesap ayarlarınızı kontrol edin.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={settingsLink}
              >
                Güvenlik Ayarlarına Git
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Hesabınızın güvenliği bizim için önemlidir.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
