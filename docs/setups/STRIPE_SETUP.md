# Stripe Integration Setup Guide

This guide will help you set up Stripe for payment processing and subscription management in your Next.js application.

## Prerequisites

- A Stripe account (create one at [stripe.com](https://stripe.com)) - **FREE** to sign up
- Access to your Stripe Dashboard

## Important: Stripe Availability

**⚠️ Stripe is NOT available in Turkey (Türkiye)**

If you're located in Turkey, Stripe cannot be used for receiving payments. Consider these alternatives:
- **iyzico** - Turkey's leading payment provider ([iyzico.com](https://www.iyzico.com))
- **PayTR** - Turkish payment gateway ([paytr.com](https://www.paytr.com))
- **Papara Business** - Modern Turkish payment solution ([papara.com/business](https://www.papara.com/business))

**For testing/learning purposes only:** You can create a Stripe account with another country, but you won't be able to receive real payments or transfer money to Turkish bank accounts.

## Step 1: Get Your API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Test Mode** (toggle in the top right)
3. Navigate to **Developers → API Keys**
4. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

## Step 2: Create Subscription Products & Prices

### Recommended Pricing Structure

This base stack uses the following pricing tiers (you can customize these):

| Plan | Monthly | Yearly | Savings |
|------|---------|--------|---------|
| **Pro** | $9.99/mo | $99.99/yr | ~17% |
| **Enterprise** | $29.99/mo | $299.99/yr | ~17% |

### Create Pro Plan

1. Go to **Products** in your Stripe Dashboard
   - Direct link: [https://dashboard.stripe.com/test/products](https://dashboard.stripe.com/test/products)
2. Click **"+ Add Product"**
3. Fill in product details:
   - **Name**: `Pro Plan`
   - **Description**: `Perfect for professionals and small teams`
   - **Image**: (Optional) Upload a logo/icon
4. Add **Monthly Pricing**:
   - Click **"Add pricing"**
   - **Pricing model**: `Standard pricing`
   - **Price**: `9.99` (or your preferred amount)
   - **Currency**: `USD` (or your currency)
   - **Billing period**: `Recurring`
   - **Billing frequency**: `Monthly`
   - Click **"Add price"**
   - **📋 Copy the Price ID** (e.g., `price_1ABC123xyz...`)
   - Save this as `STRIPE_PRO_MONTHLY_PRICE_ID`

5. Add **Yearly Pricing**:
   - In the same product, click **"Add another price"**
   - **Price**: `99.99`
   - **Billing frequency**: `Yearly`
   - Click **"Add price"**
   - **📋 Copy the Price ID**
   - Save this as `STRIPE_PRO_YEARLY_PRICE_ID`

### Create Enterprise Plan

1. Click **"+ Add Product"** again
2. Fill in:
   - **Name**: `Enterprise Plan`
   - **Description**: `For large teams and organizations`
3. Add **Monthly Pricing**:
   - **Price**: `29.99`
   - **Billing frequency**: `Monthly`
   - **📋 Copy Price ID** → `STRIPE_ENTERPRISE_MONTHLY_PRICE_ID`
4. Add **Yearly Pricing**:
   - **Price**: `299.99`
   - **Billing frequency**: `Yearly`
   - **📋 Copy Price ID** → `STRIPE_ENTERPRISE_YEARLY_PRICE_ID`

### Optional: Add Product Metadata

You can add metadata to products for feature flags:

1. In each product, scroll down to **"Metadata"** section
2. Click **"Add metadata"**
3. Add key-value pairs for features:
   ```
   max_api_calls: 10000
   max_team_members: 5
   priority_support: true
   custom_branding: false
   ```

This metadata can be used in your app to enable/disable features based on subscription tier.

## Step 3: Configure Environment Variables

Add these to your `.env` file:

```bash
# Stripe API Keys (from Step 1)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Stripe Product Price IDs (from Step 2)
STRIPE_PRO_MONTHLY_PRICE_ID=price_YOUR_PRO_MONTHLY_ID
STRIPE_PRO_YEARLY_PRICE_ID=price_YOUR_PRO_YEARLY_ID
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_YOUR_ENTERPRISE_MONTHLY_ID
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_YOUR_ENTERPRISE_YEARLY_ID

# Webhook Secret (we'll get this in Step 4)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

**⚠️ Important:**
- **NO quotes** around values (common mistake!)
- **NO spaces** around the `=` sign
- Replace `YOUR_..._HERE` with actual values from Stripe Dashboard
- Keep this file private (already in `.gitignore`)

## Step 4: Set Up Webhooks

### For Local Development (Using Stripe CLI)

#### Install Stripe CLI

**Windows:**
1. Download from [GitHub Releases](https://github.com/stripe/stripe-cli/releases/latest)
2. Download `stripe_X.X.X_windows_x86_64.zip`
3. Extract and add to PATH, or run from folder

**macOS (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

#### Setup Webhook Forwarding

1. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```
   This will open your browser for authentication.

2. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Copy the webhook signing secret:**
   - The command will output: `Ready! Your webhook signing secret is whsec_xxxxx`
   - **📋 Copy this value** to your `.env` file as `STRIPE_WEBHOOK_SECRET`

4. **Keep the CLI running** while developing (run in a separate terminal)

### For Production

1. Go to **Developers → Webhooks** in Stripe Dashboard
   - Direct link: [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"+ Add Endpoint"**
3. Configure endpoint:
   - **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
   - **Description**: `Production webhook endpoint`
4. **Select events to listen to** (click "Select events"):

   **Required events:**
   - `checkout.session.completed` - Payment successful
   - `checkout.session.expired` - Checkout expired
   - `customer.subscription.created` - New subscription
   - `customer.subscription.updated` - Subscription changed
   - `customer.subscription.deleted` - Subscription cancelled
   - `invoice.payment_succeeded` - Recurring payment successful
   - `invoice.payment_failed` - Payment failed

   **Optional but recommended:**
   - `customer.created`
   - `customer.updated`
   - `customer.deleted`
   - `payment_method.attached`
   - `payment_method.detached`

5. Click **"Add Endpoint"**
6. Click on your newly created endpoint
7. Click **"Reveal"** under "Signing secret"
8. **📋 Copy the signing secret** (`whsec_...`) and update your production `.env`

## Step 5: Test the Integration

### 1. Start Your Development Server

```bash
npm run dev
```

### 2. Start Stripe Webhook Forwarding (in another terminal)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 3. Test Subscription Flow

1. Visit `http://localhost:3000/[locale]/pricing` (e.g., `/en/pricing` or `/tr/pricing`)
2. Click **"Subscribe"** on a plan (Pro or Enterprise)
3. Use Stripe test cards:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | ✅ Successful payment |
| `4000 0025 0000 3155` | 🔐 Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | ❌ Declined (insufficient funds) |
| `4000 0000 0000 0002` | ❌ Declined (generic) |

**For all test cards:**
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP/Postal code**: Any 5 digits (e.g., `12345`)

### 4. Verify Webhook Events

Check your Stripe CLI terminal - you should see events like:
```
→ Ready! You're ready to start testing your webhook
→ checkout.session.completed [evt_xxx]
→ customer.subscription.created [evt_xxx]
→ invoice.payment_succeeded [evt_xxx]
```

### 5. Check Stripe Dashboard

1. Go to [Stripe Dashboard → Payments](https://dashboard.stripe.com/test/payments)
2. You should see your test payment
3. Go to [Customers](https://dashboard.stripe.com/test/customers)
4. Your user should be listed with an active subscription

### 6. Check Billing Dashboard (In Your App)

1. Log in to your app
2. Go to **Settings → Billing** (or `/[locale]/dashboard/billing`)
3. You should see:
   - Current subscription status
   - Active plan (Pro/Enterprise)
   - Next billing date
   - Billing history

## Step 6: Testing Scenarios

### Cancel Subscription
1. Go to Billing page
2. Click "Cancel Subscription"
3. Verify the subscription is marked for cancellation

### Resume Subscription
1. After canceling, click "Resume Subscription"
2. Verify the subscription is active again

### View Invoices
1. Check the Invoices section in Billing page
2. Click "View" to see the hosted invoice

## Stripe Customer Portal

The integration includes Stripe's built-in Customer Portal where users can:
- Update payment methods
- View billing history
- Download invoices
- Manage subscriptions

Access it by clicking **"Manage Billing"** on the Billing page.

## Important Notes

### Test Mode vs Live Mode

- **Test Mode**: Use for development and testing
  - No real charges
  - Use test card numbers
  - Prefix: `pk_test_` and `sk_test_`

- **Live Mode**: Use for production
  - Real charges
  - Real credit cards only
  - Prefix: `pk_live_` and `sk_live_`

### Database Schema

The integration uses these tables:
- `subscriptions` - User subscription status
- `payment_methods` - Saved payment methods
- `invoices` - Invoice history

All tables are automatically created via Drizzle migrations.

### Security

- ✅ Webhook signatures are verified
- ✅ All sensitive operations use server actions
- ✅ Stripe secret key is never exposed to client
- ✅ Database queries include authentication checks

## Troubleshooting

### Webhook Not Working

1. Check webhook signing secret is correct
2. Verify webhook URL is accessible
3. Check Stripe CLI is running (for local dev)
4. Review webhook event logs in Stripe Dashboard

### Subscription Not Created

1. Check server logs for errors
2. Verify Stripe keys are correct
3. Ensure database is running
4. Check webhook events were received

### Payment Declined

1. Use valid test card: `4242 4242 4242 4242`
2. Check card expiry is in the future
3. Verify test mode is enabled

## Going to Production

### Pre-Launch Checklist

Before accepting real payments:

- [ ] Complete Stripe business verification
- [ ] Switch to **Live Mode** in Stripe Dashboard
- [ ] Create products and prices in live mode (repeat Step 2)
- [ ] Update `.env` with live API keys:
  ```bash
  STRIPE_SECRET_KEY=sk_live_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
  ```
- [ ] Update all price IDs to live price IDs
- [ ] Set up production webhook endpoint (Step 4 - Production)
- [ ] Update `STRIPE_WEBHOOK_SECRET` with production secret
- [ ] Deploy to production environment
- [ ] Test with a small real payment (e.g., $0.50)
- [ ] Verify webhook events are received
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Review [Stripe Compliance Guide](https://stripe.com/docs/security/guide)
- [ ] Monitor Stripe Dashboard → Developers → Logs for errors

### Important Production Notes

1. **Different API Keys**: Live mode uses different keys (`sk_live_`, `pk_live_`)
2. **Different Price IDs**: Products created in test mode won't work in live mode
3. **Webhook Secrets**: Production webhook has a different signing secret
4. **Real Charges**: All payments in live mode are real - funds will be transferred
5. **Payout Schedule**: Stripe holds funds initially (7-14 days for new accounts)

## Additional Resources

### Stripe Documentation
- **Main Docs**: [https://stripe.com/docs](https://stripe.com/docs)
- **Testing Guide**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Webhooks**: [https://stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
- **Checkout**: [https://stripe.com/docs/payments/checkout](https://stripe.com/docs/payments/checkout)
- **Customer Portal**: [https://stripe.com/docs/billing/subscriptions/integrating-customer-portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- **Stripe CLI**: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
- **Event Types**: [https://stripe.com/docs/api/events/types](https://stripe.com/docs/api/events/types)

### Quick Reference

**Test Mode Prefixes:**
- API Keys: `pk_test_...`, `sk_test_...`
- Webhooks: `whsec_...`
- Products: `prod_...`
- Prices: `price_...`

**Live Mode Prefixes:**
- API Keys: `pk_live_...`, `sk_live_...`
- Webhooks: `whsec_...`

### Transaction Fees (Approximate)
- **US/International**: 2.9% + $0.30 per successful charge
- **Europe**: 1.4% + €0.25 (European cards), 2.9% + €0.25 (non-European)
- **Pricing varies by country**: Check [Stripe Pricing](https://stripe.com/pricing)

## Support

### If You Encounter Issues

1. **Check Stripe Dashboard Logs**
   - Go to [Developers → Logs](https://dashboard.stripe.com/test/logs)
   - Filter by API errors or webhook failures

2. **Verify Environment Variables**
   - Run `npm run dev` and check for env validation errors
   - Ensure no quotes or spaces in `.env` file
   - Confirm you're using test keys in development

3. **Test Webhook Delivery**
   - Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Manually trigger events: `stripe trigger checkout.session.completed`
   - Check webhook signature verification

4. **Review Server Logs**
   - Check your terminal/console for errors
   - Look for Stripe API errors or validation failures

5. **Common Issues & Fixes**
   - **"No such price"**: Using wrong mode (test vs live) or wrong price ID
   - **"Invalid API key"**: Check for typos, quotes, or wrong mode
   - **Webhook signature failed**: Ensure `STRIPE_WEBHOOK_SECRET` matches CLI output
   - **CORS errors**: Use Server Actions, not client-side Stripe API calls

### Getting Help

- **Stripe Support**: [https://support.stripe.com](https://support.stripe.com)
- **Stripe Community**: [https://github.com/stripe](https://github.com/stripe)
- **Base Stack Docs**: See `CLAUDE.md` and `TODO.md` for implementation details

---

**Last Updated**: 2025-12-28
**Stripe API Version**: Latest (auto-updated by Stripe)
**Base Stack Version**: Next.js 15.5.9 + Auth.js v5
