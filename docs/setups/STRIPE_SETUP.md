# Stripe Integration Setup Guide

This guide will help you set up Stripe for payment processing and subscription management in your Next.js application.

## Prerequisites

- A Stripe account (create one at [stripe.com](https://stripe.com))
- Access to your Stripe Dashboard

## Step 1: Get Your API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Test Mode** (toggle in the top right)
3. Navigate to **Developers → API Keys**
4. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

## Step 2: Create Subscription Products & Prices

### Create Pro Plan

1. Go to **Products** in your Stripe Dashboard
2. Click **Add Product**
3. Fill in:
   - **Name**: `Pro Plan`
   - **Description**: `Perfect for professionals and small teams`
4. Add pricing:
   - **Monthly**: $29/month
     - Click **Add another price**
     - Set to **Recurring** → **Monthly**
     - Price: $29
     - Copy the **Price ID** (starts with `price_`)
   - **Yearly**: $279/year
     - Click **Add another price**
     - Set to **Recurring** → **Yearly**
     - Price: $279
     - Copy the **Price ID** (starts with `price_`)

### Create Enterprise Plan

1. Click **Add Product** again
2. Fill in:
   - **Name**: `Enterprise Plan`
   - **Description**: `For large teams and organizations`
3. Add pricing:
   - **Monthly**: $99/month
   - **Yearly**: $949/year
4. Copy both **Price IDs**

## Step 3: Configure Environment Variables

Add these to your `.env` file:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"

# Stripe Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID="price_YOUR_PRO_MONTHLY_ID"
STRIPE_PRO_YEARLY_PRICE_ID="price_YOUR_PRO_YEARLY_ID"
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="price_YOUR_ENTERPRISE_MONTHLY_ID"
STRIPE_ENTERPRISE_YEARLY_PRICE_ID="price_YOUR_ENTERPRISE_YEARLY_ID"

# Webhook Secret (we'll get this in Step 4)
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"
```

## Step 4: Set Up Webhooks

### For Local Development (Using Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the **webhook signing secret** (starts with `whsec_`) and add it to `.env`

### For Production

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click **Add Endpoint**
3. Set **Endpoint URL** to: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_method.attached`
   - `payment_method.detached`
5. Click **Add Endpoint**
6. Copy the **Signing Secret** and update your production `.env`

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

1. Visit `http://localhost:3000/pricing`
2. Click on a plan (Pro or Enterprise)
3. Use Stripe test cards:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Use any future expiry date (e.g., 12/34)
   - Use any 3-digit CVC
   - Use any 5-digit ZIP code

### 4. Verify Webhook Events

Check your Stripe CLI terminal - you should see events like:
- `customer.subscription.created`
- `invoice.payment_succeeded`

### 5. Check Billing Dashboard

1. Log in to your app
2. Go to **Settings → Billing**
3. You should see your active subscription

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

1. Switch to **Live Mode** in Stripe Dashboard
2. Create live products and prices
3. Update `.env` with live keys:
   ```bash
   STRIPE_SECRET_KEY="sk_live_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
   STRIPE_WEBHOOK_SECRET="whsec_..." # From production webhook
   ```
4. Update price IDs to live price IDs
5. Test with small real payment first
6. Monitor webhook delivery in Stripe Dashboard

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)

## Support

If you encounter any issues:
1. Check Stripe Dashboard → Developers → Logs
2. Review server logs for errors
3. Verify all environment variables are set
4. Test webhook delivery manually
