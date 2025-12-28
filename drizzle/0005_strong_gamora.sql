ALTER TABLE "invoices" ALTER COLUMN "stripe_invoice_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "stripe_customer_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ALTER COLUMN "stripe_payment_method_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "provider" text DEFAULT 'stripe' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "iyzico_payment_id" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "iyzico_conversation_id" text;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "provider" text DEFAULT 'stripe' NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "iyzico_card_token" text;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "iyzico_card_user_key" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "provider" text DEFAULT 'stripe' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "iyzico_subscription_reference_code" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "iyzico_customer_reference_code" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "iyzico_current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "interval" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_iyzico_payment_id_unique" UNIQUE("iyzico_payment_id");--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_iyzico_card_token_unique" UNIQUE("iyzico_card_token");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_iyzico_subscription_reference_code_unique" UNIQUE("iyzico_subscription_reference_code");