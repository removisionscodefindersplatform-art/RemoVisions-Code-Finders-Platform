# Payment Integration Setup Guide

This guide will help you configure Stripe and PayPal payment processing for the RemoVisions Code Finders Platform.

## Prerequisites

- Stripe account: https://dashboard.stripe.com/register
- PayPal Business account: https://www.paypal.com/business/account/
- Node.js 16+ installed
- All AI API keys configured

## Stripe Setup

### Step 1: Create Stripe Account & Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in
3. Navigate to **Developers** → **API Keys**
4. Copy your:
   - **Secret Key** (starts with `sk_live_` or `sk_test_`)
   - **Publishable Key** (starts with `pk_live_` or `pk_test_`)

### Step 2: Create Price IDs for Subscription Tiers

1. In Stripe Dashboard, go to **Products**
2. Click **+ Add Product**
3. Create products for each tier:

**Basic Tier:**
- Name: "Basic Plan"
- Type: Service
- Add pricing: $9.99/month
- Copy the **Price ID** (starts with `price_`)

**Pro Tier:**
- Name: "Pro Plan"
- Type: Service
- Add pricing: $29.99/month
- Copy the **Price ID**

**Enterprise Tier:**
- Name: "Enterprise Plan"
- Type: Service
- Add pricing: $99.99/month
- Copy the **Price ID**

### Step 3: Add Stripe Keys to `.env`

```env
STRIPE_SECRET_KEY=sk_live_your-actual-secret-key-here
STRIPE_PUBLIC_KEY=pk_live_your-actual-public-key-here
STRIPE_BASIC_PRICE_ID=price_1234567890abcdef
STRIPE_PRO_PRICE_ID=price_0987654321fedcba
STRIPE_ENTERPRISE_PRICE_ID=price_abcdef1234567890
```

**Note:** Use `sk_test_` and `pk_test_` for testing.

---

## PayPal Setup

### Step 1: Create PayPal Business Account

1. Go to [PayPal Business](https://www.paypal.com/business/account/)
2. Sign up or log in
3. Navigate to **Settings** → **API Signature** (or REST API)

### Step 2: Get PayPal API Credentials

1. In PayPal Account, go to **Apps & Credentials**
2. Select **Sandbox** (for testing) or **Live** (for production)
3. Under **REST API apps**, click **Create App** (if needed)
4. Copy:
   - **Client ID**
   - **Secret**

### Step 3: Add PayPal Keys to `.env`

```env
PAYPAL_CLIENT_ID=your-actual-client-id-here
PAYPAL_CLIENT_SECRET=your-actual-secret-here
PAYPAL_MODE=sandbox
```

**For Production:**
```env
PAYPAL_MODE=live
```

---

## Environment File Setup

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your actual API keys:
```env
# Stripe
STRIPE_SECRET_KEY=sk_live_your-key-here
STRIPE_PUBLIC_KEY=pk_live_your-key-here
STRIPE_BASIC_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx

# PayPal
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-secret
PAYPAL_MODE=sandbox

# Other APIs
OPENAI_API_KEY=sk-your-key-here
GOOGLE_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here

# App Settings
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
```

---

## Testing Payment Integration

### Start the Server

```bash
npm install
npm run dev
```

### Test Stripe Checkout

```bash
curl -X POST http://localhost:3000/api/checkout/stripe \
  -H "Content-Type: application/json" \
  -d '{"tier": "pro"}'
```

**Expected Response:**
```json
{
  "sessionId": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/pay/cs_test_xxxxx"
}
```

### Test PayPal Order Creation

```bash
curl -X POST http://localhost:3000/api/checkout/paypal \
  -H "Content-Type: application/json" \
  -d '{"tier": "pro"}'
```

**Expected Response:**
```json
{
  "orderId": "5O190127070446715",
  "status": "CREATED"
}
```

### Check Configuration

```bash
curl http://localhost:3000/api/config
```

**Expected Response:**
```json
{
  "stripe": {
    "publicKey": "pk_live_xxxxx",
    "ready": true
  },
  "paypal": {
    "clientId": "your-client-id",
    "ready": true
  },
  "aiAgents": {
    "openai": true,
    "gemini": true,
    "claude": true
  },
  "environment": "development"
}
```

---

## Security Best Practices

⚠️ **IMPORTANT:**

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use environment variables** - Deploy with actual keys via platform settings (Netlify, Heroku, etc.)
3. **Keep keys secret** - Don't share or expose them in code/logs
4. **Rotate keys regularly** - Especially if compromised
5. **Use webhook signatures** - Verify Stripe/PayPal webhooks with signing keys
6. **Test in Sandbox first** - Always test with `sk_test_` and `sandbox` mode
7. **Enable HTTPS** - Required for production payment processing

---

## Troubleshooting

### "Stripe is not configured"
- Ensure `STRIPE_SECRET_KEY` is set in `.env`
- Check that key starts with `sk_`

### "PayPal is not configured"
- Ensure `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set
- Verify `PAYPAL_MODE` is set to `sandbox` or `live`

### "Price ID not found"
- Make sure you've created products in Stripe
- Copy the correct Price ID (starts with `price_`)
- Add it to the correct env variable (e.g., `STRIPE_BASIC_PRICE_ID`)

### Webhook Errors
- Configure webhook endpoints in Stripe/PayPal dashboards
- Verify webhook signing keys match

---

## Next Steps

1. ✅ Configure Stripe & PayPal keys
2. ✅ Test checkout endpoints
3. 🔄 Deploy to Netlify/production
4. 🔄 Set up webhooks for payment confirmations
5. 🚀 Monitor transactions in Stripe/PayPal dashboards

---

## Useful Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer](https://developer.paypal.com/)
- [Express.js Guide](https://expressjs.com/)
- [Environment Variables Best Practices](https://www.12factor.net/config)

---

## Support

For issues:
- Check Stripe/PayPal documentation
- Review GitHub Issues
- Contact maintainers

---

**Happy Payments! 💳✨**
