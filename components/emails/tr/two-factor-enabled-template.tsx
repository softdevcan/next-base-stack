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
      <Preview>İki faktörlü kimlik doğrulama aktif edildi</Preview>
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
              Hesabınızda iki faktörlü kimlik doğrulama (2FA) başarıyla aktif edildi.
            </Text>
            <Section className="bg-[#f0fdf4] rounded p-4 my-4 border border-[#86efac]">
              <Text className="text-[#166534] text-[12px] leading-[20px] m-0">
                <strong>Aktif Edilen Yöntem:</strong> {methodText}
              </Text>
              <Text className="text-[#166534] text-[12px] leading-[20px] m-0 mt-2">
                <strong>Aktif Edilme Zamanı:</strong> {enableTime}
              </Text>
              {ipAddress && (
                <Text className="text-[#166534] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>IP Adresi:</strong> {ipAddress}
                </Text>
              )}
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Hesabınız artık iki faktörlü kimlik doğrulama ile daha güvenli. Bundan sonra giriş
              yaparken şifrenizin yanında bir doğrulama kodu da girmeniz gerekecek.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Eğer bu değişikliği siz yapmadıysanız, lütfen derhal hesap ayarlarınızı kontrol edin
              ve gerekirse desteğe başvurun.
            </Text>
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
