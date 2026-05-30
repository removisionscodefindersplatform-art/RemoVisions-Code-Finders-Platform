# Command Codex in Termux

Use this quick path when you want Codex to build or revise the RemoVision dashboard from an Android Termux shell.

## 1. Install the required tools

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs git
npm install -g @openai/codex
```

## 2. Clone and prepare the platform

```bash
git clone https://github.com/removisionscodefindersplatform-art/RemoVisions-Code-Finders-Platform.git
cd RemoVisions-Code-Finders-Platform
npm install
cp .env.example .env
nano .env
```

Add your private keys only inside `.env`; do not paste secrets into a Codex chat prompt.

## 3. Use this Codex command

```bash
codex "Build RemoVision's dashboard, connect Stripe and PayPal checkout readiness for upper tier payments, keep secrets in .env only, run npm test, commit changes, and write a PR summary."
```

## 4. Required payment variables

Stripe Checkout needs:

```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_DEFAULT_PRICE_ID=price_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_AGENCY=price_...
```

PayPal Checkout needs:

```env
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_CURRENCY=USD
```

Switch `PAYPAL_ENVIRONMENT` to `live` only after sandbox testing succeeds.

## 5. Run the dashboard

```bash
npm run dev
```

Open the URL shown in the terminal. In Termux, expose it with a tunnel or deploy it to a host before using live payment return URLs.
