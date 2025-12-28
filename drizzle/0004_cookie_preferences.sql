ALTER TABLE "profiles" ADD COLUMN "cookie_consent_given" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "cookie_consent_date" timestamp;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "cookie_necessary" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "cookie_functional" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "cookie_analytics" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "cookie_marketing" boolean DEFAULT false NOT NULL;