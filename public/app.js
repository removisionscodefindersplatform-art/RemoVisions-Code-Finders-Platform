const readinessList = document.querySelector('#readiness-list');
const tierGrid = document.querySelector('#tier-grid');
const checkoutResult = document.querySelector('#checkout-result');

function badge(isReady) {
  return `<span class="badge ${isReady ? 'ready' : 'missing'}">${isReady ? 'Ready' : 'Needs keys'}</span>`;
}

function renderReadiness(config) {
  const items = [
    ['Stripe checkout', config.payments.stripe.ready],
    ['PayPal orders', config.payments.paypal.ready],
    ['OpenAI assistant', config.aiAssistants.openai],
    ['Gemini assistant', config.aiAssistants.gemini],
    ['Claude assistant', config.aiAssistants.claude],
  ];

  readinessList.innerHTML = items
    .map(([label, ready]) => `<div class="readiness-item"><strong>${label}</strong>${badge(ready)}</div>`)
    .join('');
}

function renderTiers(tiers) {
  tierGrid.innerHTML = Object.entries(tiers)
    .map(([tierKey, tier]) => {
      const features = tier.features.map((feature) => `<li>${feature}</li>`).join('');
      return `
        <article class="card tier-card">
          <h3>${tier.name}</h3>
          <div class="tier-price">${tier.price}</div>
          <p>${tier.description}</p>
          <ul>${features}</ul>
          <div class="checkout-actions">
            <button class="checkout-button stripe" data-provider="stripe" data-tier="${tierKey}">Start Stripe checkout</button>
            <button class="checkout-button paypal" data-provider="paypal" data-tier="${tierKey}">Start PayPal checkout</button>
          </div>
        </article>
      `;
    })
    .join('');
}

async function startCheckout(provider, tier) {
  checkoutResult.textContent = `Preparing ${provider} checkout for ${tier}…`;

  const response = await fetch(`/api/checkout/${provider}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier }),
  });
  const result = await response.json();

  if (!response.ok) {
    checkoutResult.textContent = result.error || 'Checkout failed. Check server logs.';
    return;
  }

  const checkoutUrl = result.checkoutUrl || result.approvalUrl;
  if (checkoutUrl) {
    checkoutResult.innerHTML = `Checkout ready. <a href="${checkoutUrl}">Open ${provider} checkout</a>.`;
    return;
  }

  checkoutResult.textContent = result.message || `${provider} is not fully configured yet.`;
}

async function bootDashboard() {
  const response = await fetch('/api/config');
  const config = await response.json();
  renderReadiness(config);
  renderTiers(config.tiers);

  tierGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-provider][data-tier]');
    if (!button) {
      return;
    }

    startCheckout(button.dataset.provider, button.dataset.tier).catch((error) => {
      checkoutResult.textContent = error.message;
    });
  });
}

bootDashboard().catch((error) => {
  readinessList.textContent = error.message;
});
