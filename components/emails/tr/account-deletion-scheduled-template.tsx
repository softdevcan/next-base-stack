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
      <Preview>Hesap silme işlemi planlandı</Preview>
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
              Hesabınızın silinmesi için bir talep aldık. Hesabınız ve tüm verileriniz aşağıdaki
              tarihte kalıcı olarak silinecektir.
            </Text>
            <Section className="bg-[#fef2f2] rounded p-4 my-4 border-2 border-[#dc2626]">
              <Text className="text-[#991b1b] text-[14px] leading-[20px] m-0 font-semibold text-center">
                Silme Tarihi: {scheduledDate}
              </Text>
            </Section>
            <Text className="text-black text-[14px] leading-[24px] font-semibold">
              Bu işlem geri alınamaz ve şunları içerir:
            </Text>
            <ul className="text-black text-[14px] leading-[24px]">
              <li>Tüm profil bilgileriniz</li>
              <li>Hesap ayarlarınız</li>
              <li>Oturum geçmişiniz</li>
              <li>İlişkili tüm veriler</li>
            </ul>
            <Text className="text-black text-[14px] leading-[24px]">
              Eğer fikrini değiştirdiyseniz veya bu isteği siz yapmadıysanız, aşağıdaki butona
              tıklayarak hesap silme işlemini iptal edebilirsiniz.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#dc2626] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={cancelLink}
              >
                Hesap Silme İşlemini İptal Et
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Bizi kullandığınız için teşekkür ederiz. Görüşmek üzere!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
