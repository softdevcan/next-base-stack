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
      <Preview>Yeni cihazdan giriş yapıldı</Preview>
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
              Hesabınıza daha önce kullanılmamış bir cihazdan giriş yapıldı.
            </Text>
            <Section className="bg-[#fffbeb] rounded p-4 my-4 border border-[#fde68a]">
              <Text className="text-[#92400e] text-[12px] leading-[20px] m-0">
                <strong>Giriş Zamanı:</strong> {loginTime}
              </Text>
              {ipAddress && (
                <Text className="text-[#92400e] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>IP Adresi:</strong> {ipAddress}
                </Text>
              )}
              {location && (
                <Text className="text-[#92400e] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>Konum:</strong> {location}
                </Text>
              )}
              {device && (
                <Text className="text-[#92400e] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>Cihaz:</strong> {device}
                </Text>
              )}
              {browser && (
                <Text className="text-[#92400e] text-[12px] leading-[20px] m-0 mt-2">
                  <strong>Tarayıcı:</strong> {browser}
                </Text>
              )}
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Eğer bu siz değilseniz, hesabınız tehlikede olabilir. Lütfen derhal şifrenizi
              değiştirin ve güvenlik ayarlarınızı kontrol edin.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={settingsLink}
              >
                Güvenlik Ayarlarına Git
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Eğer bu giriş sizseniz, bu e-postayı görmezden gelebilirsiniz.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Hesabınızın güvenliği için tüm giriş aktivitelerini takip ediyoruz.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
