import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { getUserSubscription, getUserInvoices } from "@/lib/db/queries";
import { SUBSCRIPTION_PLANS, formatCurrency, isSubscriptionActive } from "@/lib/stripe";
import { CurrentPlanCard } from "./current-plan-card";
import { ManageBillingButton } from "./manage-billing-button";
import { CancelSubscriptionButton } from "./cancel-subscription-button";
import { ResumeSubscriptionButton } from "./resume-subscription-button";
import { InvoicesTable } from "./invoices-table";
import { format } from "date-fns";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "billing" });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const subscription = await getUserSubscription();
  const invoices = await getUserInvoices();

  const t = await getTranslations("billing");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Separator />

      {/* Current Plan */}
      <CurrentPlanCard subscription={subscription} />

      {/* Manage Billing */}
      {subscription && subscription.plan !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("actions.managePortal")}</CardTitle>
            <CardDescription>
              Update payment methods, view invoices, and manage your subscription
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col sm:flex-row gap-4">
            <ManageBillingButton />
            {subscription.cancelAtPeriodEnd ? (
              <ResumeSubscriptionButton />
            ) : (
              isSubscriptionActive(subscription.status) && <CancelSubscriptionButton />
            )}
          </CardFooter>
        </Card>
      )}

      {/* Invoices */}
      {invoices && invoices.length > 0 && <InvoicesTable invoices={invoices} />}
    </div>
  );
}
