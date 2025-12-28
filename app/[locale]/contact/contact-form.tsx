"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { submitContactForm } from "./actions";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await submitContactForm(formData);

      if (result.success) {
        toast.success(t("toast.success"));
        e.currentTarget.reset();
      } else {
        toast.error(result.error || t("toast.error"));
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(t("toast.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("fields.name.label")}</Label>
        <Input
          id="name"
          name="name"
          placeholder={t("fields.name.placeholder")}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("fields.email.label")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t("fields.email.placeholder")}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">{t("fields.subject.label")}</Label>
        <Input
          id="subject"
          name="subject"
          placeholder={t("fields.subject.placeholder")}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t("fields.message.label")}</Label>
        <Textarea
          id="message"
          name="message"
          placeholder={t("fields.message.placeholder")}
          rows={5}
          required
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        <Send className="mr-2 h-4 w-4" />
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
