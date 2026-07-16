# 🔐 Security & Environment Setup Guide

## CRITICAL: Your `.env` File Was Exposed!

⚠️ **ACTION REQUIRED IMMEDIATELY:**

1. **Go to PayPal Developer Dashboard**: https://developer.paypal.com/dashboard/
2. **Revoke your exposed credentials** - Generate NEW Client ID and Secret
3. **Update your `.env` file** with new credentials
4. **Never commit `.env` to GitHub again**

---

## Safe Setup Instructions

### Step 1: Create Your Local `.env` File

```bash
# Copy the template
cp .env.example .env

# Edit it with your REAL credentials
nano .env  # or use your favorite editor
```

### Step 2: Add Your Real Credentials

Edit `.env` and replace placeholders with actual values:

```env
# PayPal - Get from: https://developer.paypal.com/dashboard/
PAYPAL_CLIENT_ID=AQx1234567890abcdefghijk...
PAYPAL_CLIENT_SECRET=EGZxyz9876543210fedcba...
PAYPAL_MODE=sandbox

# Stripe - Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_1234567890abcdef...
STRIPE_PUBLIC_KEY=pk_test_1234567890abcdef...
```

### Step 3: Verify `.env` is NOT Committed

```bash
# Check if .env is in .gitignore
cat .gitignore | grep .env

# Make sure .env is NOT tracked
git status
```

✅ You should NOT see `.env` in the output!

---

## Best Practices

### ✅ DO:
- ✅ Add `.env` to `.gitignore`
- ✅ Create `.env.example` with placeholder values
- ✅ Store secrets as environment variables in deployment (Netlify, Heroku, etc.)
- ✅ Use different credentials for sandbox and production
- ✅ Rotate credentials regularly
- ✅ Use strong, unique credentials for each service

### ❌ DON'T:
- ❌ Commit `.env` files
- ❌ Hardcode secrets in code
- ❌ Share credentials in PRs, issues, or comments
- ❌ Use the same credentials across environments
- ❌ Log or print sensitive information
- ❌ Include credentials in Docker images or config files

---

## For Production Deployment (Netlify)

When deploying to Netlify, **never use `.env` file**. Instead:

1. Go to your Netlify site dashboard
2. **Site settings** → **Build & deploy** → **Environment**
3. Add each variable:
   - `PAYPAL_CLIENT_ID=your-production-client-id`
   - `PAYPAL_CLIENT_SECRET=your-production-secret`
   - `PAYPAL_MODE=live`
   - (Same for Stripe and other APIs)

Netlify keeps these secure and out of your code!

---

## Credentials to Get

### PayPal
- Website: https://developer.paypal.com/dashboard/
- What you need:
  - Client ID (Sandbox or Live)
  - Secret (Sandbox or Live)
  - Change PAYPAL_MODE to `sandbox` for testing, `live` for production

### Stripe
- Website: https://dashboard.stripe.com/apikeys
- What you need:
  - Secret Key (test or live)
  - Publishable Key (test or live)
  - Price IDs for each tier (create products first)

### OpenAI, Google Gemini, Anthropic Claude
- Add their API keys similarly

---

## If Your Credentials Were Compromised

1. 🚨 **Immediately revoke them** in the provider's dashboard
2. 🚨 **Generate new credentials**
3. 🚨 **Update your `.env` file** locally
4. 🚨 **Check your billing** - Monitor for unauthorized charges
5. 🚨 **Contact support** - Notify the provider of the breach

---

## File Structure (CORRECT)

```
RemoVisions-Code-Finders-Platform/
├── .env              ← Your REAL secrets (NEVER commit) - local only
├── .env.example      ← Template with placeholders (safe to commit)
├── .gitignore        ← Includes .env (protects you)
├── package.json
├── server.js
├── PAYMENT_SETUP.md
├── SECURITY.md       ← This file
└── ...
```

---

## Testing Locally

```bash
# Install dependencies
npm install

# Start server
npm run dev

# Test PayPal endpoint
curl -X POST http://localhost:3000/api/checkout/paypal \
  -H "Content-Type: application/json" \
  -d '{"tier": "pro"}'

# Check configuration (hides actual keys)
curl http://localhost:3000/api/config
```

---

## Questions?

- Check [PayPal Security Docs](https://developer.paypal.com/docs/api/overview/)
- Check [Stripe Security Docs](https://stripe.com/docs/security)
- Review GitHub's [Keeping secrets safe](https://docs.github.com/en/rest/guides/authenticating-to-the-rest-api#keeping-your-secrets-safe)

---

**Remember: Never commit `.env` - Keep your secrets safe! 🔐**
