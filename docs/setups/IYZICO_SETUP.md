# iyzico Integration Setup Guide

This guide will help you set up iyzico for payment processing and subscription management in your Next.js application. iyzico is Turkey's leading payment gateway provider.

## Prerequisites

- An iyzico account (create one at [iyzico.com](https://www.iyzico.com))
- Turkish business registration (required for live mode)
- Access to your iyzico Dashboard

## Important: iyzico Availability

**✅ iyzico is AVAILABLE in Turkey (Türkiye)**

iyzico is the recommended payment provider for Turkish businesses:
- **Full Turkish Support**: Turkish language, Turkish Lira (TRY), local payment methods
- **Local Infrastructure**: Servers in Turkey, faster processing
- **Turkish Banking Integration**: Direct integration with Turkish banks
- **Compliance**: Fully compliant with Turkish regulations

**For international businesses:** If you need to accept payments globally, consider using both Stripe (international) and iyzico (Turkey).

---

## Step 1: Create iyzico Account

### Sign Up (Free)

1. Go to [https://merchant.iyzipay.com/auth/register](https://merchant.iyzipay.com/auth/register)
2. Fill in your business information:
   - Business name (Firma Adı)
   - Tax number (Vergi Numarası)
   - Contact details
3. Verify your email address
4. Complete identity verification (KYC)

**Pricing:** iyzico charges a commission per transaction:
- **Standard Rate**: 2.99% + ₺0.25 per transaction
- **Volume Discounts**: Available for high-volume merchants
- **No Monthly Fees**: Pay only for successful transactions

---

## Step 2: Get API Keys

### Sandbox (Test) Keys

1. Log in to [iyzico Merchant Panel](https://merchant.iyzipay.com)
2. Go to **Settings (Ayarlar)** → **API & Security (API ve Güvenlik)**
3. Find your **Sandbox Credentials**:
   - **API Key**: Used for authentication
   - **Secret Key**: Used for request signing

### Live (Production) Keys

**Only after business verification is complete:**

1. In the same section, find **Live Credentials**
2. Copy your **Live API Key** and **Live Secret Key**

---

## Step 3: Understanding iyzico Subscription Model

iyzico uses a different approach than Stripe for recurring payments:

### Option 1: Subscription API (Recommended)
- Dedicated subscription management
- Automatic recurring charges
- Better for SaaS businesses

### Option 2: Recurring Payments with Cards
- Save card information (tokenization)
- Manual recurring charges via API
- More control but requires more implementation

**This guide uses Option 1 (Subscription API)**

---

## Step 4: Create Subscription Products

### iyzico Subscription Structure

Unlike Stripe, iyzico subscriptions require:
1. **Subscription Plan** (equivalent to Stripe Product)
2. **Pricing Tier** (equivalent to Stripe Price)
3. **Customer Reference** (linked to your user)

### Recommended Pricing Structure

Match your Stripe pricing for consistency:

| Plan | Monthly (TRY) | Yearly (TRY) | Savings |
|------|---------------|--------------|---------|
| **Pro** | ₺349.99/mo | ₺3,499.99/yr | ~17% |
| **Enterprise** | ₺999.99/mo | ₺9,999.99/yr | ~17% |

**Note:** Convert USD prices to TRY based on current exchange rates.

### Create Plans Programmatically

iyzico doesn't have a UI for creating subscription plans. You must create them via API:

```javascript
// Example: Create Pro Monthly Plan
const request = {
  locale: 'tr',
  conversationId: '123456',
  name: 'Pro Plan - Monthly',
  pricingPlanReferenceCode: 'PRO_MONTHLY',
  price: '349.99',
  currencyCode: 'TRY',
  paymentInterval: 'MONTHLY',
  paymentIntervalCount: 1,
  trialPeriodDays: 0,
  planPaymentType: 'RECURRING',
};

const result = await iyzipay.subscriptionPlan.create(request);
```

**Save the `pricingPlanReferenceCode` for each plan:**
- `IYZICO_PRO_MONTHLY_PLAN_CODE`
- `IYZICO_PRO_YEARLY_PLAN_CODE`
- `IYZICO_ENTERPRISE_MONTHLY_PLAN_CODE`
- `IYZICO_ENTERPRISE_YEARLY_PLAN_CODE`

---

## Step 5: Configure Environment Variables

Add these to your `.env` file:

```bash
# iyzico API Credentials
IYZICO_API_KEY=your_api_key_here
IYZICO_SECRET_KEY=your_secret_key_here
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com  # Use https://api.iyzipay.com for production

# iyzico Subscription Plan Codes
IYZICO_PRO_MONTHLY_PLAN_CODE=PRO_MONTHLY
IYZICO_PRO_YEARLY_PLAN_CODE=PRO_YEARLY
IYZICO_ENTERPRISE_MONTHLY_PLAN_CODE=ENTERPRISE_MONTHLY
IYZICO_ENTERPRISE_YEARLY_PLAN_CODE=ENTERPRISE_YEARLY

# Webhook Secret (for signature verification)
IYZICO_WEBHOOK_SECRET=your_webhook_secret_here
```

**⚠️ Important:**
- **NO quotes** around values
- Keep this file private (already in `.gitignore`)
- Sandbox keys start with `sandbox-`

---

## Step 6: Install iyzico SDK

```bash
npm install iyzipay
```

The official iyzico Node.js SDK provides:
- Request signing
- API abstractions
- Type definitions

---

## Step 7: Set Up Webhooks

iyzico sends webhook notifications for payment events.

### Configure Webhook URL

1. Go to **Settings → API & Security → Webhook Settings**
2. Add your webhook URL:
   - **Development**: Use ngrok or similar tunneling service
   - **Production**: `https://yourdomain.com/api/webhooks/iyzico`
3. Select events to listen to:
   - `SUBSCRIPTION_ORDER_SUCCESS` - Subscription payment successful
   - `SUBSCRIPTION_ORDER_FAILED` - Payment failed
   - `SUBSCRIPTION_RENEWED` - Subscription renewed
   - `SUBSCRIPTION_CANCELED` - Subscription cancelled
   - `SUBSCRIPTION_UPGRADED` - Plan upgraded
   - `SUBSCRIPTION_DOWNGRADED` - Plan downgraded

### Webhook Signature Verification

iyzico signs webhooks with HMAC-SHA256. You must verify signatures:

```javascript
import crypto from 'crypto';

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('base64');

  return signature === expectedSignature;
}
```

---

## Step 8: Database Schema Updates

Add iyzico-specific fields to your existing `subscriptions` table:

```sql
ALTER TABLE subscriptions ADD COLUMN provider VARCHAR(20) DEFAULT 'stripe';
ALTER TABLE subscriptions ADD COLUMN iyzico_subscription_reference_code VARCHAR(255);
ALTER TABLE subscriptions ADD COLUMN iyzico_customer_reference_code VARCHAR(255);
```

**Provider values:**
- `'stripe'` - Stripe subscription
- `'iyzico'` - iyzico subscription

This allows users to have subscriptions from either provider.

---

## Step 9: Test the Integration

### Test Cards (Sandbox Only)

Use these test cards in sandbox mode:

| Card Number | Scenario | CVV | Expiry |
|-------------|----------|-----|--------|
| `5528790000000008` | ✅ Successful payment | `123` | `12/30` |
| `5528790000000016` | ❌ Insufficient funds | `123` | `12/30` |
| `5528790000000024` | ❌ Invalid card | `123` | `12/30` |

**For all test cards:**
- **Cardholder Name**: Any name
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### Test Workflow

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Use ngrok for webhook testing:**
   ```bash
   ngrok http 3000
   ```
   Copy the HTTPS URL and configure it in iyzico dashboard.

3. **Test the flow:**
   - Visit `http://localhost:3000/[locale]/pricing`
   - Click "Subscribe" on a plan
   - Enter test card: `5528790000000008`
   - Complete 3D Secure (use any code in sandbox)
   - Verify webhook events received

4. **Check iyzico Dashboard:**
   - Go to [Transactions](https://merchant.iyzipay.com/transactions)
   - You should see your test payment
   - Go to [Subscriptions](https://merchant.iyzipay.com/subscriptions)
   - Your subscription should be listed

---

## Step 10: Key Differences from Stripe

### API Structure
- **Stripe**: RESTful API with clear resource endpoints
- **iyzico**: Request/Response objects with conversation IDs

### Subscription Management
- **Stripe**: Built-in subscription lifecycle management
- **iyzico**: Requires more manual tracking of subscription states

### Currency
- **Stripe**: Multi-currency support
- **iyzico**: Primarily Turkish Lira (TRY), some support for USD/EUR

### 3D Secure
- **Stripe**: Optional, handled automatically
- **iyzico**: Mandatory for Turkish cards, requires redirect flow

### Customer Portal
- **Stripe**: Hosted customer portal available
- **iyzico**: Must build your own subscription management UI

---

## Step 11: Implementation Checklist

### Backend Setup
- [ ] Install `iyzipay` npm package
- [ ] Add environment variables to `.env`
- [ ] Update database schema with `provider` field
- [ ] Create iyzico client wrapper in `lib/iyzico.ts`
- [ ] Create subscription plans via API (save reference codes)

### Payment Flow
- [ ] Create pricing page variant for iyzico
- [ ] Implement 3D Secure redirect flow
- [ ] Handle payment callbacks
- [ ] Create subscription on successful payment
- [ ] Store customer and subscription reference codes

### Webhook Integration
- [ ] Create webhook endpoint `/api/webhooks/iyzico`
- [ ] Implement signature verification
- [ ] Handle subscription events (success, failure, renewal, cancellation)
- [ ] Update subscription status in database
- [ ] Send notification emails

### Billing Dashboard
- [ ] Display current iyzico subscription
- [ ] Show payment history
- [ ] Cancel subscription functionality
- [ ] Upgrade/downgrade plan options
- [ ] Manual invoice generation

### Admin Panel
- [ ] Add payment provider switcher
- [ ] Display iyzico vs Stripe statistics
- [ ] Filter subscriptions by provider
- [ ] Revenue tracking per provider

---

## Step 12: Going to Production

### Pre-Launch Checklist

Before accepting real payments:

- [ ] Complete iyzico business verification (KYC)
- [ ] Switch to **Live API Keys**
- [ ] Create subscription plans in **live mode**
- [ ] Update environment variables with live credentials
- [ ] Set up production webhook endpoint
- [ ] Test with a small real payment
- [ ] Verify webhook delivery in production
- [ ] Set up error monitoring
- [ ] Review iyzico's compliance requirements
- [ ] Ensure PCI DSS compliance (iyzico handles card data)

### Important Production Notes

1. **Different API Keys**: Live mode uses different keys
2. **Real Charges**: All payments in live mode are real
3. **3D Secure**: Mandatory for Turkish cards
4. **Payout Schedule**: T+2 to T+7 days depending on your agreement
5. **Settlement**: Payments are settled to your Turkish bank account

---

## Step 13: Multi-Provider Strategy

### Option 1: User Chooses Provider
- Show both Stripe and iyzico payment options
- User selects preferred method during checkout
- Track `provider` field in subscriptions table

### Option 2: Geographic Auto-Select
- Detect user's country (IP or user preference)
- Turkish users → iyzico
- International users → Stripe
- Allow manual override

### Option 3: Admin Controlled
- Admin enables/disables payment providers
- Single provider mode or multi-provider mode
- Useful for phased rollout

**Recommended:** Option 2 (Geographic) with Option 3 (Admin Toggle)

---

## Additional Resources

### Official Documentation
- **iyzico Docs**: [https://dev.iyzipay.com](https://dev.iyzipay.com)
- **API Reference**: [https://dev.iyzipay.com/tr/api](https://dev.iyzipay.com/tr/api)
- **Subscription API**: [https://dev.iyzipay.com/tr/subscription](https://dev.iyzipay.com/tr/subscription)
- **Node.js SDK**: [https://github.com/iyzico/iyzipay-node](https://github.com/iyzico/iyzipay-node)

### Test Environment
- **Sandbox Dashboard**: [https://sandbox-merchant.iyzipay.com](https://sandbox-merchant.iyzipay.com)
- **Test Cards**: [https://dev.iyzipay.com/tr/test](https://dev.iyzipay.com/tr/test)

### Support
- **iyzico Support**: [destek@iyzico.com](mailto:destek@iyzico.com)
- **Technical Support**: Available in Turkish and English
- **Developer Community**: [https://github.com/iyzico](https://github.com/iyzico)

---

## Troubleshooting

### Common Issues

**"INVALID_API_KEY" Error**
- Check API key is correct
- Ensure no quotes or spaces in `.env`
- Verify you're using sandbox key in development

**3D Secure Redirect Fails**
- Check callback URL is accessible
- Ensure HTTPS in production
- Verify callback URL matches registered domain

**Webhook Not Received**
- Check webhook URL is publicly accessible
- Verify signature verification logic
- Review webhook logs in iyzico dashboard

**Subscription Creation Fails**
- Ensure pricing plan exists (create via API first)
- Check `pricingPlanReferenceCode` matches exactly
- Verify customer reference code is unique

**Payment Declined**
- Use valid test card: `5528790000000008`
- Check card expiry is in future
- Ensure 3D Secure flow completes

---

## Security Best Practices

1. **Never expose Secret Key**: Keep in environment variables only
2. **Always verify webhook signatures**: Prevent fake webhook attacks
3. **Use HTTPS in production**: Required for card data security
4. **Implement rate limiting**: Protect your webhook endpoints
5. **Log webhook events**: For debugging and audit trails
6. **Sanitize user input**: Prevent injection attacks
7. **Store minimal card data**: Let iyzico handle PCI compliance

---

## Comparison: Stripe vs iyzico

| Feature | Stripe | iyzico |
|---------|--------|--------|
| **Turkey Support** | ❌ Not available | ✅ Full support |
| **Global Support** | ✅ 135+ countries | ⚠️ Limited (mainly Turkey) |
| **Currency** | Multi-currency | Primarily TRY |
| **3D Secure** | Optional | Mandatory (Turkish cards) |
| **Setup Complexity** | Easy | Moderate |
| **Transaction Fees** | 2.9% + $0.30 | 2.99% + ₺0.25 |
| **API Quality** | Excellent | Good |
| **Documentation** | Excellent | Good (Turkish/English) |
| **Customer Portal** | Built-in | Build your own |
| **Subscription Management** | Excellent | Good |
| **Payout Speed** | 7-14 days | 2-7 days |

**Recommendation:** Use both!
- Stripe for international customers
- iyzico for Turkish customers

---

**Last Updated**: 2025-12-28
**iyzico API Version**: v2
**SDK Version**: iyzipay@2.x
**Base Stack Version**: Next.js 15.5.9 + Auth.js v5
