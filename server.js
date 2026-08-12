import express from 'express';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

// Initialize PayPal
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const environment = process.env.PAYPAL_MODE === 'production' 
  ? new paypal.core.LiveEnvironment(clientId, clientSecret)
  : new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

// API Configuration Endpoint
app.get('/api/config', (req, res) => {
  const config = {
    stripe: {
      publicKey: process.env.STRIPE_PUBLIC_KEY || 'not-configured',
      ready: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLIC_KEY),
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || 'not-configured',
      ready: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    },
    aiAgents: {
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GOOGLE_API_KEY,
      claude: !!process.env.ANTHROPIC_API_KEY,
    },
    environment: process.env.NODE_ENV || 'development',
  };
  res.json(config);
});

// Stripe Checkout Session Endpoint
app.post('/api/checkout/stripe', async (req, res) => {
  try {
    const { tier } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(400).json({
        error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.',
      });
    }

    const priceMap = {
      basic: process.env.STRIPE_BASIC_PRICE_ID,
      pro: process.env.STRIPE_PRO_PRICE_ID,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    };

    const priceId = priceMap[tier];

    if (!priceId) {
      return res.status(400).json({
        error: `Price ID for tier "${tier}" not configured. Add STRIPE_${tier.toUpperCase()}_PRICE_ID to your .env file.`,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.BASE_URL || 'http://localhost:3000'}/success`,
      cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/cancel`,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// PayPal Order Creation Endpoint
app.post('/api/checkout/paypal', async (req, res) => {
  try {
    const { tier } = req.body;

    if (!process.env.PAYPAL_CLIENT_ID) {
      return res.status(400).json({
        error: 'PayPal is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to your .env file.',
      });
    }

    const tierPrices = {
      basic: '9.99',
      pro: '29.99',
      enterprise: '99.99',
    };

    const amount = tierPrices[tier];

    if (!amount) {
      return res.status(400).json({
        error: `Tier "${tier}" not recognized. Use: basic, pro, or enterprise.`,
      });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount,
          },
          description: `RemoVisions ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier Subscription`,
        },
      ],
      application_context: {
        brand_name: 'RemoVisions Code Finders Platform',
        return_url: `${process.env.BASE_URL || 'http://localhost:3000'}/success`,
        cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/cancel`,
      },
    });

    const order = await client.execute(request);
    res.json({ orderId: order.result.id, status: order.result.status });
  } catch (error) {
    console.error('PayPal error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', port });
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 RemoVisions Server running on http://localhost:${port}`);
  console.log(`📊 Configuration: GET /api/config`);
  console.log(`💳 Stripe Checkout: POST /api/checkout/stripe`);
  console.log(`💳 PayPal Checkout: POST /api/checkout/paypal`);
  console.log(`❤️  Health Check: GET /health`);
});
