import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = useTranslations("billing");

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-2 text-gray-600">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Plan */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">{t("plan.current")}</h2>
          <div className="mb-4">
            <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
              {t("plan.free")}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            You are currently on the free plan. Upgrade to unlock more features.
          </p>
        </div>

        {/* Payment Method */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">{t("payment.method")}</h2>
          <p className="mb-4 text-sm text-gray-600">No payment method added yet.</p>
          <Button variant="outline">{t("payment.addCard")}</Button>
        </div>
      </div>

      {/* Pricing Plans - Placeholder */}
      <div className="mt-8">
        <h2 className="mb-6 text-2xl font-bold">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Free Plan */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">{t("plan.free")}</h3>
            <p className="mb-4 text-3xl font-bold">$0</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Basic features</li>
              <li>✓ Up to 10 projects</li>
              <li>✓ Community support</li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="rounded-lg border-2 border-gray-900 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">{t("plan.pro")}</h3>
            <p className="mb-4 text-3xl font-bold">$29</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ All Free features</li>
              <li>✓ Unlimited projects</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">{t("plan.enterprise")}</h3>
            <p className="mb-4 text-3xl font-bold">Custom</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ All Pro features</li>
              <li>✓ Custom integrations</li>
              <li>✓ Dedicated support</li>
              <li>✓ SLA guarantee</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
