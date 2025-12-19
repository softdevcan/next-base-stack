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

interface WelcomeEmailTemplateProps {
  name?: string;
  dashboardLink: string;
}

export const WelcomeEmailTemplate = ({ name, dashboardLink }: WelcomeEmailTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Next Base Stack'e hoş geldiniz!</Preview>
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
              Next Base Stack'e hoş geldiniz! Hesabınız başarıyla oluşturuldu ve artık tüm
              özelliklere erişebilirsiniz.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Platformumuzda şunları yapabilirsiniz:
            </Text>
            <ul className="text-black text-[14px] leading-[24px]">
              <li>Profil bilgilerinizi özelleştirin</li>
              <li>İki faktörlü kimlik doğrulama ile hesabınızı güvende tutun</li>
              <li>Hesap ayarlarınızı yönetin</li>
              <li>Ve çok daha fazlası...</li>
            </ul>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={dashboardLink}
              >
                Dashboard'a Git
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Herhangi bir sorunuz olursa, lütfen bizimle iletişime geçmekten çekinmeyin.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Next Base Stack ile başarılı bir yolculuk dileriz! 🚀
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
