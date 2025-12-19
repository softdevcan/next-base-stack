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

interface ResetPasswordTemplateProps {
  resetLink: string;
}

export const ResetPasswordTemplate = ({ resetLink }: ResetPasswordTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Şifrenizi sıfırlayın</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Next Base Stack
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">Merhaba,</Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Hesabınız için şifre sıfırlama talebi aldık. Şifrenizi sıfırlamak için lütfen
              aşağıdaki butona tıklayın.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={resetLink}
              >
                Şifreyi Sıfırla
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Eğer bu isteği siz yapmadıysanız, hesabınız güvendedir ve bu e-postayı silebilirsiniz.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Bu bağlantı güvenliğiniz için belirli bir süre sonra geçerliliğini yitirecektir.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
