"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createIyzicoCheckout } from "./actions-iyzico";
import { Iyzico3DSHandler } from "./iyzico-3ds-handler";

const iyzicoCheckoutFormSchema = z.object({
  // Card information
  cardHolderName: z.string().min(2, "Kart sahibinin adını girin"),
  cardNumber: z.string().regex(/^\d{16}$/, "16 haneli kart numarasını girin"),
  expireMonth: z.string().regex(/^\d{2}$/, "2 haneli ay girin (örn: 01)"),
  expireYear: z.string().regex(/^\d{4}$/, "4 haneli yıl girin (örn: 2025)"),
  cvc: z.string().regex(/^\d{3,4}$/, "3 veya 4 haneli CVC kodunu girin"),
  // Buyer information
  buyerName: z.string().min(2, "Adınızı girin"),
  buyerSurname: z.string().min(2, "Soyadınızı girin"),
  buyerEmail: z.string().email("Geçerli bir e-posta adresi girin"),
  buyerPhone: z.string().min(10, "Geçerli bir telefon numarası girin"),
  identityNumber: z.string().length(11, "11 haneli TC Kimlik No girin"),
  // Address information
  address: z.string().min(10, "Tam adresinizi girin"),
  city: z.string().min(2, "Şehir girin"),
  zipCode: z.string().optional(),
});

interface IyzicoCheckoutFormProps {
  plan: "pro" | "enterprise";
  interval: "monthly" | "yearly";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function IyzicoCheckoutForm({ plan, interval, onSuccess, onCancel }: IyzicoCheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [threeDSData, setThreeDSData] = useState<{
    threeDSHtmlContent: string;
    conversationId: string;
  } | null>(null);

  const form = useForm<z.infer<typeof iyzicoCheckoutFormSchema>>({
    resolver: zodResolver(iyzicoCheckoutFormSchema),
    defaultValues: {
      cardHolderName: "",
      cardNumber: "",
      expireMonth: "",
      expireYear: "",
      cvc: "",
      buyerName: "",
      buyerSurname: "",
      buyerEmail: "",
      buyerPhone: "",
      identityNumber: "",
      address: "",
      city: "",
      zipCode: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof iyzicoCheckoutFormSchema>) => {
    setIsSubmitting(true);

    try {
      const result = await createIyzicoCheckout({
        ...values,
        plan,
        interval,
        country: "Turkey",
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/billing?canceled=true`,
      });

      if (result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      if (result.requires3DS && result.threeDSHtmlContent) {
        // Show 3DS verification form
        setThreeDSData({
          threeDSHtmlContent: result.threeDSHtmlContent,
          conversationId: result.conversationId || "",
        });
        setIsSubmitting(false);
        return;
      }

      // Success without 3DS
      toast.success("Abonelik başarıyla oluşturuldu!");
      onSuccess?.();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsSubmitting(false);
    }
  };

  // Show 3DS handler if required
  if (threeDSData) {
    return (
      <Iyzico3DSHandler
        threeDSHtmlContent={threeDSData.threeDSHtmlContent}
        conversationId={threeDSData.conversationId}
        onSuccess={onSuccess}
        onError={() => setThreeDSData(null)}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Kart Bilgileri</CardTitle>
            <CardDescription>Ödeme yapacağınız kart bilgilerini girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="cardHolderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kart Sahibinin Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="AHMET YILMAZ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kart Numarası</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234567890123456"
                      maxLength={16}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="expireMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ay</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="12"
                        maxLength={2}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expireYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yıl</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="2025"
                        maxLength={4}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVC</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123"
                        maxLength={4}
                        type="password"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
            <CardDescription>Fatura bilgilerinizi girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buyerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ahmet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyerSurname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Yılmaz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="buyerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ahmet@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buyerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="+905551234567" {...field} />
                  </FormControl>
                  <FormDescription>Başında +90 olacak şekilde girin</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="identityNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TC Kimlik No</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12345678901"
                      maxLength={11}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adres Bilgileri</CardTitle>
            <CardDescription>Fatura adresinizi girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres</FormLabel>
                  <FormControl>
                    <Input placeholder="Mahalle, Sokak, No, Daire" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şehir</FormLabel>
                    <FormControl>
                      <Input placeholder="İstanbul" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posta Kodu (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="34000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "İşleniyor..." : "Ödemeyi Tamamla"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              İptal
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
