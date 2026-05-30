import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { request as httpsRequest } from 'node:https';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 3000);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const tiers = {
  starter: {
    name: 'Starter Builder',
    price: '$29/mo',
    description: 'Launch a guided website or app with AI planning, DNS checklists, and project coaching.',
    features: ['AI build plan', 'DNS setup checklist', 'Dashboard project tracker'],
  },
  pro: {
    name: 'Upper Tier Pro',
    price: '$99/mo',
    description: 'Adds multi-agent code support, training integrations, and priority implementation guidance.',
    features: ['Five coding assistants', 'YouTube training hub', 'Priority project workflow'],
  },
  agency: {
    name: 'Agency Command',
    price: '$299/mo',
    description: 'For teams selling sites, apps, domains, widgets, and integrations from one command center.',
    features: ['Client workspaces', 'Payment-ready offers', 'Domain and DNS launch board'],
  },
};

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload, null, 2));
}

function getPublicConfig() {
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY);
  const paypalReady = Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

  return {
    appName: 'RemoVision\'s Code Finders Platform',
    environment: process.env.NODE_ENV || 'development',
    payments: {
      stripe: {
        ready: stripeReady,
        publishableKeyConfigured: Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
        checkoutMode: process.env.STRIPE_CHECKOUT_MODE || 'subscription',
      },
      paypal: {
        ready: paypalReady,
        clientIdConfigured: Boolean(process.env.PAYPAL_CLIENT_ID),
        environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
      },
    },
    aiAssistants: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      gemini: Boolean(process.env.GOOGLE_API_KEY),
      claude: Boolean(process.env.ANTHROPIC_API_KEY),
    },
    tiers,
  };
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.statusCode = 400;
    throw error;
  }
}

function normalizeTier(tier) {
  if (typeof tier !== 'string' || !tiers[tier]) {
    return 'pro';
  }

  return tier;
}

function httpsJsonRequest({ hostname, path: requestPath, method = 'GET', headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      {
        hostname,
        path: requestPath,
        method,
        headers: {
          Accept: 'application/json',
          ...headers,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          const data = raw ? JSON.parse(raw) : {};

          if (res.statusCode >= 400) {
            const error = new Error(data.error?.message || data.message || 'Payment provider request failed.');
            error.statusCode = res.statusCode;
            error.details = data;
            reject(error);
            return;
          }

          resolve(data);
        });
      },
    );

    req.on('error', reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

async function createStripeCheckoutSession(tierKey) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      provider: 'stripe',
      ready: false,
      message: 'Add STRIPE_SECRET_KEY plus tier price IDs to .env to enable Stripe Checkout.',
      tier: tiers[tierKey],
    };
  }

  const priceId = process.env[`STRIPE_PRICE_${tierKey.toUpperCase()}`] || process.env.STRIPE_DEFAULT_PRICE_ID;

  if (!priceId) {
    return {
      provider: 'stripe',
      ready: false,
      message: `Stripe is configured, but no price ID was found for ${tierKey}. Add STRIPE_PRICE_${tierKey.toUpperCase()} or STRIPE_DEFAULT_PRICE_ID.`,
      tier: tiers[tierKey],
    };
  }

  const baseUrl = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
  const body = new URLSearchParams({
    mode: process.env.STRIPE_CHECKOUT_MODE || 'subscription',
    success_url: `${baseUrl}/?checkout=stripe-success&tier=${tierKey}`,
    cancel_url: `${baseUrl}/?checkout=stripe-cancel&tier=${tierKey}`,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'metadata[tier]': tierKey,
  }).toString();

  const session = await httpsJsonRequest({
    hostname: 'api.stripe.com',
    path: '/v1/checkout/sessions',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
  });

  return {
    provider: 'stripe',
    ready: true,
    checkoutUrl: session.url,
    sessionId: session.id,
  };
}

async function getPayPalAccessToken() {
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const body = 'grant_type=client_credentials';
  const host = process.env.PAYPAL_ENVIRONMENT === 'live' ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';
  const token = await httpsJsonRequest({
    hostname: host,
    path: '/v1/oauth2/token',
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
  });

  return { host, accessToken: token.access_token };
}

async function createPayPalOrder(tierKey) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return {
      provider: 'paypal',
      ready: false,
      message: 'Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to .env to enable PayPal order creation.',
      tier: tiers[tierKey],
    };
  }

  const tierPrices = {
    starter: process.env.PAYPAL_PRICE_STARTER || '29.00',
    pro: process.env.PAYPAL_PRICE_PRO || '99.00',
    agency: process.env.PAYPAL_PRICE_AGENCY || '299.00',
  };
  const { host, accessToken } = await getPayPalAccessToken();
  const baseUrl = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
  const body = JSON.stringify({
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: tierKey,
        description: tiers[tierKey].name,
        amount: {
          currency_code: process.env.PAYPAL_CURRENCY || 'USD',
          value: tierPrices[tierKey],
        },
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          return_url: `${baseUrl}/?checkout=paypal-success&tier=${tierKey}`,
          cancel_url: `${baseUrl}/?checkout=paypal-cancel&tier=${tierKey}`,
        },
      },
    },
  });

  const order = await httpsJsonRequest({
    hostname: host,
    path: '/v2/checkout/orders',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
  });

  return {
    provider: 'paypal',
    ready: true,
    orderId: order.id,
    approvalUrl: order.links?.find((link) => link.rel === 'payer-action' || link.rel === 'approve')?.href,
  };
}

async function handleApi(req, res) {
  if (req.method === 'GET' && req.url === '/api/config') {
    json(res, 200, getPublicConfig());
    return true;
  }

  if (req.method === 'POST' && req.url === '/api/checkout/stripe') {
    const body = await readJsonBody(req);
    json(res, 200, await createStripeCheckoutSession(normalizeTier(body.tier)));
    return true;
  }

  if (req.method === 'POST' && req.url === '/api/checkout/paypal') {
    const body = await readJsonBody(req);
    json(res, 200, await createPayPalOrder(normalizeTier(body.tier)));
    return true;
  }

  return false;
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = path.normalize(decodeURIComponent(requestedPath)).replace(/^[/\\]+/, '');
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const content = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const handled = await handleApi(req, res);
    if (handled) {
      return;
    }

    await serveStatic(req, res);
  } catch (error) {
    json(res, error.statusCode || 500, {
      error: error.message || 'Unexpected server error',
      details: process.env.NODE_ENV === 'development' ? error.details : undefined,
    });
  }
});

server.listen(PORT, () => {
  console.log(`RemoVision dashboard running at http://localhost:${PORT}`);
});
